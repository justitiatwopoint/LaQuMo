/* ==========================================================================
   LAQUMO - SCHRÖDINGER TUNNELLING
   File: js/sim-schrodinger.js

   An electron wave packet in one dimension, in real units:
     length in nanometres (nm), energy in electronvolts (eV), time in femtoseconds (fs).
   Time-dependent Schrödinger equation
     i hbar dpsi/dt = -(hbar^2 / 2m) d^2psi/dx^2 + V(x) psi
   solved on a grid with the Crank–Nicolson method, which is unitary: probability
   is conserved exactly, apart from what the absorbing layers at the two ends remove
   (and that is counted, so R + T always adds up to 100%).

   For the square barrier, the panel also shows the exact theoretical transmission
   for this packet: the plane-wave result T(E) averaged over the packet's momenta.
   The simulated T converges to it, which is a check anyone can do.
   ========================================================================== */

class SchrodingerSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Physical constants (electron)
    this.HBAR = 0.6582119569;       // eV·fs
    this.C2 = 0.0380998212;          // hbar^2 / (2 m_e) in eV·nm^2

    // Grid: x from -11 to +11 nm. |x| > 7 nm are absorbing layers (not drawn).
    this.xMin = -11; this.xMax = 11; this.dx = 0.01;
    this.N = Math.round((this.xMax - this.xMin) / this.dx) + 1;
    this.view = 7;                   // visible region: -7 ... +7 nm
    this.dt = 0.02;                  // fs per step

    // Parameters (changed by the controls)
    this.potentialType = 'tunneling';
    this.V0 = 2.0;                   // eV
    this.energy = 1.0;               // mean kinetic energy of the packet, eV
    this.widthSlider = 0.3;          // slider value (nm for the barrier)
    this.sigma = 0.9;                // packet width, nm
    this.isRunning = true;

    const n = this.N;
    this.x = new Float64Array(n);
    for (let j = 0; j < n; j++) this.x[j] = this.xMin + j * this.dx;
    this.V = new Float64Array(n);
    this.W = new Float64Array(n);    // absorbing potential (eV)
    this.re = new Float64Array(n); this.im = new Float64Array(n);
    this.dRe = new Float64Array(n); this.dIm = new Float64Array(n);
    this.cRe = new Float64Array(n); this.cIm = new Float64Array(n);  // Thomas c'
    this.mRe = new Float64Array(n); this.mIm = new Float64Array(n);  // 1 / pivot

    for (let j = 0; j < n; j++) {
      const d = Math.abs(this.x[j]) - this.view;
      this.W[j] = d > 0 ? 3.0 * (d / (this.xMax - this.view)) ** 2 : 0;
    }

    this.initEvents();
    this.rebuild();
    this.resize();
    this.animate();
  }

  // ---- Geometry of the three potentials -----------------------------------
  regionWidth() {
    if (this.potentialType === 'tunneling') return this.widthSlider;            // 0.1–1.0 nm
    if (this.potentialType === 'well') return 1 + 4 * this.widthSlider;         // 1.4–5.0 nm
    return null;
  }

  startPosition() {
    if (this.potentialType === 'tunneling') return -3.5;
    if (this.potentialType === 'well') return 0.0;
    return -2.0;
  }

  buildPotential() {
    // The barrier (or well) covers exactly round(a/dx) grid points, centred on x = 0,
    // so its width on the grid is exactly a and matches the theory.
    const a = this.regionWidth();
    const jc = Math.round((0 - this.xMin) / this.dx);
    if (a !== null) {
      const count = Math.max(1, Math.round(a / this.dx));
      this.jL = jc - Math.floor(count / 2);
      this.jR = this.jL + count - 1;
    }
    for (let j = 0; j < this.N; j++) {
      const inRegion = a !== null && j >= this.jL && j <= this.jR;
      let v = 0;
      if (this.potentialType === 'tunneling') v = inRegion ? this.V0 : 0;
      else if (this.potentialType === 'well') v = inRegion ? 0 : this.V0;
      else v = this.V0 * (this.x[j] / 2) ** 2;   // harmonic: V0 at x = ±2 nm
      this.V[j] = v;
    }
  }

  // Pre-factor the Crank–Nicolson matrix A = 1 + i dt/(2 hbar) H  (tridiagonal)
  factorise() {
    const n = this.N, s = this.dt / (2 * this.HBAR), t = this.C2 / (this.dx * this.dx);
    this.offIm = -s * t;                       // off-diagonal of A = i * offIm (purely imaginary)
    let cRe = 0, cIm = 0;
    for (let j = 0; j < n; j++) {
      // diagonal b_j = 1 + i s (2t + V_j - i W_j) = (1 + s W_j) + i s (2t + V_j)
      let bRe = 1 + s * this.W[j], bIm = s * (2 * t + this.V[j]);
      if (j > 0) {           // pivot = b_j - a * c'_{j-1},  a = i*offIm
        bRe -= -this.offIm * cIm;
        bIm -= this.offIm * cRe;
      }
      const den = bRe * bRe + bIm * bIm;
      const mRe = bRe / den, mIm = -bIm / den;  // 1 / pivot
      this.mRe[j] = mRe; this.mIm[j] = mIm;
      // c'_j = c / pivot with c = i*offIm
      cRe = -this.offIm * mIm; cIm = this.offIm * mRe;
      this.cRe[j] = cRe; this.cIm[j] = cIm;
    }
  }

  resetWavepacket() {
    const k0 = Math.sqrt(this.energy / this.C2), x0 = this.startPosition();
    let norm = 0;
    for (let j = 0; j < this.N; j++) {
      const u = this.x[j] - x0;
      const g = Math.exp(-(u * u) / (4 * this.sigma * this.sigma));
      this.re[j] = g * Math.cos(k0 * u);
      this.im[j] = g * Math.sin(k0 * u);
      norm += (this.re[j] ** 2 + this.im[j] ** 2) * this.dx;
    }
    const f = 1 / Math.sqrt(norm);
    for (let j = 0; j < this.N; j++) { this.re[j] *= f; this.im[j] *= f; }
    this.time = 0;
    this.absorbedL = 0; this.absorbedR = 0;
    this.peak0 = 0;
    for (let j = 0; j < this.N; j++) this.peak0 = Math.max(this.peak0, this.re[j] ** 2 + this.im[j] ** 2);
    this.updateStats();
  }

  rebuild() {
    this.buildPotential();
    this.factorise();
    this.resetWavepacket();
    this.updateLabels();
  }

  // ---- One Crank–Nicolson step:  A psi_new = B psi_old,  B = 1 - i dt/(2 hbar) H
  stepTime() {
    const n = this.N, s = this.dt / (2 * this.HBAR), t = this.C2 / (this.dx * this.dx);
    const re = this.re, im = this.im, dRe = this.dRe, dIm = this.dIm;
    let before = 0, wl = 0, wr = 0;

    for (let j = 0; j < n; j++) {
      const p = re[j] * re[j] + im[j] * im[j];
      before += p;
      if (this.W[j] > 0) { if (j < n / 2) wl += this.W[j] * p; else wr += this.W[j] * p; }
      // (H psi)_j, with H = -t (psi_{j+1} - 2 psi_j + psi_{j-1}) + (V - iW) psi_j
      const lRe = (j > 0 ? re[j - 1] : 0) + (j < n - 1 ? re[j + 1] : 0);
      const lIm = (j > 0 ? im[j - 1] : 0) + (j < n - 1 ? im[j + 1] : 0);
      const hRe = -t * lRe + (2 * t + this.V[j]) * re[j] + this.W[j] * im[j];
      const hIm = -t * lIm + (2 * t + this.V[j]) * im[j] - this.W[j] * re[j];
      // B psi = psi - i s H psi
      dRe[j] = re[j] + s * hIm;
      dIm[j] = im[j] - s * hRe;
    }

    // Forward sweep: d'_j = (d_j - a d'_{j-1}) / pivot_j, a = i*offIm
    const off = this.offIm;
    let pRe = 0, pIm = 0;
    for (let j = 0; j < n; j++) {
      let xr = dRe[j], xi = dIm[j];
      if (j > 0) { xr -= -off * pIm; xi -= off * pRe; }
      pRe = xr * this.mRe[j] - xi * this.mIm[j];
      pIm = xr * this.mIm[j] + xi * this.mRe[j];
      dRe[j] = pRe; dIm[j] = pIm;
    }
    // Back substitution: psi_j = d'_j - c'_j psi_{j+1}
    re[n - 1] = dRe[n - 1]; im[n - 1] = dIm[n - 1];
    let after = re[n - 1] ** 2 + im[n - 1] ** 2;
    for (let j = n - 2; j >= 0; j--) {
      const cr = this.cRe[j], ci = this.cIm[j];
      re[j] = dRe[j] - (cr * re[j + 1] - ci * im[j + 1]);
      im[j] = dIm[j] - (cr * im[j + 1] + ci * re[j + 1]);
      after += re[j] * re[j] + im[j] * im[j];
    }

    // Probability removed by the absorbing layers, split by side
    const lost = Math.max(0, (before - after) * this.dx);
    if (wl + wr > 0) {
      this.absorbedL += lost * wl / (wl + wr);
      this.absorbedR += lost * wr / (wl + wr);
    }
    this.time += this.dt;
  }

  // ---- Readouts --------------------------------------------------------------
  updateStats() {
    let left = 0, right = 0, inside = 0;
    for (let j = 0; j < this.N; j++) {
      const p = (this.re[j] ** 2 + this.im[j] ** 2) * this.dx;
      if (this.potentialType === 'tunneling') {
        if (j < this.jL) left += p; else if (j > this.jR) right += p; else inside += p;
      } else if (this.potentialType === 'well') {
        if (j >= this.jL && j <= this.jR) inside += p; else right += p;
      } else {
        if (this.x[j] < 0) left += p; else right += p;
      }
    }
    let r, tr;
    if (this.potentialType === 'tunneling') { r = left + this.absorbedL; tr = right + this.absorbedR; }
    else if (this.potentialType === 'well') { r = inside; tr = right + this.absorbedL + this.absorbedR; }
    else { r = left; tr = right; }

    const tagR = document.getElementById('sch-refl-tag');
    const tagT = document.getElementById('sch-trans-tag');
    if (tagR) tagR.textContent = `${(r * 100).toFixed(1)}%`;
    if (tagT) tagT.textContent = `${(tr * 100).toFixed(1)}%`;
  }

  // Exact plane-wave transmission through a square barrier of height V, width a
  static barrierT(E, V, a, C2) {
    if (E <= 0) return 0;
    if (Math.abs(E - V) < 1e-9) return 1 / (1 + (V * a * a) / (4 * C2));
    if (E < V) {
      const kap = Math.sqrt((V - E) / C2), sh = Math.sinh(kap * a);
      return 1 / (1 + (V * V * sh * sh) / (4 * E * (V - E)));
    }
    const q = Math.sqrt((E - V) / C2), sn = Math.sin(q * a);
    return 1 / (1 + (V * V * sn * sn) / (4 * E * (E - V)));
  }

  // T averaged over the packet's momentum distribution |phi(k)|^2 ∝ exp(-2 sigma^2 (k-k0)^2)
  theoryT() {
    const k0 = Math.sqrt(this.energy / this.C2), sk = 1 / (2 * this.sigma);
    const a = (this.jR - this.jL + 1) * this.dx;
    let num = 0, den = 0;
    for (let i = -400; i <= 400; i++) {
      const k = k0 + (i / 400) * 6 * sk;
      const w = Math.exp(-2 * this.sigma * this.sigma * (k - k0) ** 2);
      den += w;
      if (k > 0) num += w * SchrodingerSimulator.barrierT(this.C2 * k * k, this.V0, a, this.C2);
    }
    return num / den;
  }

  updateLabels() {
    const set = (id, txt) => { const e = document.getElementById(id); if (e) e.textContent = txt; };
    const type = this.potentialType;
    set('val-sch-v0', `${this.V0.toFixed(1)} eV`);
    set('val-sch-energy', `${this.energy.toFixed(2)} eV`);

    const wSlider = document.getElementById('sch-width');
    if (type === 'oscillator') {
      set('sch-width-label', 'Width');
      set('val-sch-width', 'n/a');
      if (wSlider) wSlider.disabled = true;
    } else {
      set('sch-width-label', type === 'well' ? 'Well Width' : 'Barrier Width');
      set('val-sch-width', `${this.regionWidth().toFixed(2)} nm`);
      if (wSlider) wSlider.disabled = false;
    }
    set('sch-v0-label', type === 'oscillator' ? 'Potential at ±2 nm' : (type === 'well' ? 'Wall Height' : 'Barrier Height'));
    set('sch-r-label', type === 'tunneling' ? 'Reflected (R)' : (type === 'well' ? 'Inside well' : 'Left of centre'));
    set('sch-t-label', type === 'tunneling' ? 'Transmitted (T)' : (type === 'well' ? 'Escaped' : 'Right of centre'));

    const th = document.getElementById('sch-theory');
    if (th) {
      if (type === 'tunneling') {
        const T = this.theoryT();
        const cls = this.energy < this.V0
          ? 'Below the barrier top: a classical particle would always bounce back.'
          : 'Above the barrier top: a classical particle would always get through.';
        th.textContent = `Exact theory for this packet: T = ${(T * 100).toFixed(1)}%. ${cls}`;
      } else if (type === 'well') {
        th.textContent = 'Parts of the packet with energy above the wall height escape; the rest stays bound in the well, leaking only a little way into the walls.';
      } else {
        th.textContent = 'The packet swings back and forth like a pendulum, changing shape as it goes.';
      }
    }
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());
    const on = (id, fn) => { const e = document.getElementById(id); if (e) e.addEventListener('input', fn); };

    const sel = document.getElementById('sch-potential-select');
    if (sel) sel.addEventListener('change', (e) => { this.potentialType = e.target.value; this.rebuild(); });
    on('sch-v0', (e) => { this.V0 = parseFloat(e.target.value); this.rebuild(); });
    on('sch-energy', (e) => { this.energy = parseFloat(e.target.value); this.rebuild(); });
    on('sch-width', (e) => { this.widthSlider = parseFloat(e.target.value); this.rebuild(); });

    const btnPlay = document.getElementById('sch-btn-play');
    if (btnPlay) btnPlay.addEventListener('click', () => {
      this.isRunning = !this.isRunning;
      btnPlay.textContent = this.isRunning ? 'Pause' : 'Play';
    });
    const btnReset = document.getElementById('sch-btn-reset');
    if (btnReset) btnReset.addEventListener('click', () => this.resetWavepacket());
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const parent = this.canvas.parentElement;
    const w = parent.clientWidth || 600, h = parent.clientHeight || 400;
    if (w > 0 && h > 0 && (this.canvas.width !== w || this.canvas.height !== h)) {
      this.canvas.width = w; this.canvas.height = h;
    }
  }

  // ---- Drawing -------------------------------------------------------------------
  animate() {
    if (this.isRunning) {
      // About 7 fs of simulated time per second of real time (more for slow packets),
      // independent of the screen's frame rate
      const now = performance.now();
      const elapsed = Math.min(50, now - (this.lastFrame || now - 16.7));
      this.lastFrame = now;
      const perSecond = 7 * Math.max(1, Math.sqrt(1 / this.energy));   // fs per second
      this.debt = (this.debt || 0) + (perSecond * elapsed) / 1000 / this.dt;
      const steps = Math.min(20, Math.floor(this.debt));
      this.debt -= steps;
      for (let s = 0; s < steps; s++) this.stepTime();
      this.updateStats();
    } else {
      this.lastFrame = null;
    }
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  draw() {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    const css = getComputedStyle(document.documentElement);
    const ink = (css.getPropertyValue('--text-secondary') || '#57534e').trim() || '#57534e';
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.clearRect(0, 0, w, h);

    const padTop = 62, baseY = h - 34;
    const Vtop = Math.max(this.V0 * 1.3, this.energy * 2.2, 1);
    const eY = (E) => baseY - (E / Vtop) * (baseY - padTop);
    const j0 = Math.round((-this.view - this.xMin) / this.dx), j1 = Math.round((this.view - this.xMin) / this.dx);
    const X = (x) => ((x + this.view) / (2 * this.view)) * w;

    // x axis with nm ticks
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.18)' : 'rgba(43,40,35,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(w, baseY); ctx.stroke();
    ctx.fillStyle = ink;
    ctx.font = '10px "IBM Plex Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    for (let x = -6; x <= 6; x += 2) {
      const px = X(x);
      ctx.beginPath(); ctx.moveTo(px, baseY); ctx.lineTo(px, baseY + 4); ctx.stroke();
      if (x > -6 && x < 6) ctx.fillText(`${x} nm`, px, baseY + 16);
    }
    ctx.textAlign = 'start';

    // Potential V(x)
    ctx.beginPath(); ctx.moveTo(0, baseY);
    for (let j = j0; j <= j1; j += 2) ctx.lineTo(X(this.x[j]), eY(Math.min(this.V[j], Vtop * 1.05)));
    ctx.lineTo(w, baseY); ctx.closePath();
    ctx.fillStyle = dark ? 'rgba(148,163,184,0.16)' : 'rgba(71,85,105,0.12)';
    ctx.fill();
    ctx.strokeStyle = dark ? '#94a3b8' : '#475569';
    ctx.lineWidth = 1.8; ctx.stroke();

    // Packet energy E (dashed); the wave is drawn around this level
    const yE = eY(this.energy);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(217,119,6,0.75)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, yE); ctx.lineTo(w, yE); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 11px "IBM Plex Mono", Consolas, monospace';
    ctx.fillText(`E = ${this.energy.toFixed(2)} eV`, 8, yE - 6);

    // |psi|^2, scaled to the starting peak
    const pScale = (h * 0.15) / (this.peak0 || 1);   // reflections can make peaks ~4x taller
    ctx.beginPath(); ctx.moveTo(X(this.x[j0]), yE);
    for (let j = j0; j <= j1; j++) ctx.lineTo(X(this.x[j]), yE - (this.re[j] ** 2 + this.im[j] ** 2) * pScale);
    ctx.lineTo(X(this.x[j1]), yE); ctx.closePath();
    ctx.fillStyle = 'rgba(245,158,11,0.28)'; ctx.fill();
    ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.4; ctx.stroke();

    // Re(psi) and Im(psi)
    const aScale = (h * 0.11) / Math.sqrt(this.peak0 || 1);
    const line = (arr, color, width) => {
      ctx.beginPath();
      for (let j = j0; j <= j1; j++) {
        const px = X(this.x[j]), py = yE - arr[j] * aScale;
        if (j === j0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
    };
    line(this.im, dark ? 'rgba(96,165,250,0.8)' : 'rgba(37,99,235,0.7)', 1.2);
    line(this.re, '#be123c', 1.8);

    // Clock
    ctx.fillStyle = ink;
    ctx.font = '11px "IBM Plex Mono", Consolas, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`t = ${this.time.toFixed(1)} fs`, w - 10, baseY - 8);
    ctx.textAlign = 'start';
  }
}

window.SchrodingerSimulator = SchrodingerSimulator;
