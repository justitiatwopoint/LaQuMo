/* ==========================================================================
   LAQUMO - SIMULATOR 2: 1D SCHRÖDINGER EQUATION (LIGHT DAYTIME SPEC)
   ========================================================================== */

class SchrodingerSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.N = 300;
    this.dx = 1.0;
    this.dt = 0.4;
    this.time = 0;
    this.isRunning = true;

    this.potentialType = 'tunneling';
    this.barrierHeight = 45;
    this.barrierWidth = 30;
    this.waveMomentum = 0.55;
    this.waveSigma = 22;

    this.psiRe = new Float32Array(this.N);
    this.psiIm = new Float32Array(this.N);
    this.potential = new Float32Array(this.N);

    this.initPotential();
    this.resetWavepacket();
    this.initEvents();
    this.resize();
    this.animate();
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const parent = this.canvas.parentElement;
    const w = parent.clientWidth || 600;
    const h = parent.clientHeight || 400;

    if (w > 0 && h > 0 && (this.canvas.width !== w || this.canvas.height !== h)) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  initPotential() {
    this.potential.fill(0);
    const mid = Math.floor(this.N / 2);
    const halfW = Math.floor(this.barrierWidth / 2);

    if (this.potentialType === 'tunneling') {
      for (let i = mid - halfW; i <= mid + halfW; i++) {
        if (i >= 0 && i < this.N) this.potential[i] = this.barrierHeight;
      }
    } else if (this.potentialType === 'well') {
      const wellDepth = this.barrierHeight;
      for (let i = 0; i < this.N; i++) {
        if (i < mid - halfW || i > mid + halfW) this.potential[i] = wellDepth;
      }
    } else if (this.potentialType === 'oscillator') {
      const k = 0.003 * this.barrierHeight;
      for (let i = 0; i < this.N; i++) {
        const x = i - mid;
        this.potential[i] = Math.min(100, 0.5 * k * x * x);
      }
    }
  }

  resetWavepacket() {
    this.time = 0;
    const x0 = Math.floor(this.N * 0.25);

    let norm = 0;
    for (let i = 0; i < this.N; i++) {
      const x = i - x0;
      const gaussian = Math.exp(-(x * x) / (2 * this.waveSigma * this.waveSigma));
      this.psiRe[i] = gaussian * Math.cos(this.waveMomentum * i);
      this.psiIm[i] = gaussian * Math.sin(this.waveMomentum * i);
      norm += this.psiRe[i] * this.psiRe[i] + this.psiIm[i] * this.psiIm[i];
    }

    const factor = 1.0 / Math.sqrt(norm);
    for (let i = 0; i < this.N; i++) {
      this.psiRe[i] *= factor;
      this.psiIm[i] *= factor;
    }
  }

  stepTime() {
    const halfDt = this.dt * 0.5;

    for (let i = 1; i < this.N - 1; i++) {
      const laplacianIm = (this.psiIm[i + 1] - 2 * this.psiIm[i] + this.psiIm[i - 1]);
      this.psiRe[i] -= halfDt * (-0.5 * laplacianIm + this.potential[i] * 0.01 * this.psiIm[i]);
    }

    for (let i = 1; i < this.N - 1; i++) {
      const laplacianRe = (this.psiRe[i + 1] - 2 * this.psiRe[i] + this.psiRe[i - 1]);
      this.psiIm[i] += this.dt * (-0.5 * laplacianRe + this.potential[i] * 0.01 * this.psiRe[i]);
    }

    for (let i = 1; i < this.N - 1; i++) {
      const laplacianIm = (this.psiIm[i + 1] - 2 * this.psiIm[i] + this.psiIm[i - 1]);
      this.psiRe[i] -= halfDt * (-0.5 * laplacianIm + this.potential[i] * 0.01 * this.psiIm[i]);
    }

    const damp = 0.92;
    for (let i = 0; i < 15; i++) {
      this.psiRe[i] *= damp; this.psiIm[i] *= damp;
      this.psiRe[this.N - 1 - i] *= damp; this.psiIm[this.N - 1 - i] *= damp;
    }

    this.time += this.dt;
    this.updateStats();
  }

  updateStats() {
    const mid = Math.floor(this.N / 2);
    let leftSum = 0;
    let rightSum = 0;

    for (let i = 0; i < this.N; i++) {
      const prob = this.psiRe[i] * this.psiRe[i] + this.psiIm[i] * this.psiIm[i];
      if (i < mid) leftSum += prob;
      else rightSum += prob;
    }

    const total = leftSum + rightSum || 1;
    const R = ((leftSum / total) * 100).toFixed(1);
    const T = ((rightSum / total) * 100).toFixed(1);

    const tagR = document.getElementById('sch-refl-tag');
    const tagT = document.getElementById('sch-trans-tag');
    if (tagR) tagR.textContent = `${R}%`;
    if (tagT) tagT.textContent = `${T}%`;
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    const selPotential = document.getElementById('sch-potential-select');
    if (selPotential) {
      selPotential.addEventListener('change', (e) => {
        this.potentialType = e.target.value;
        this.initPotential();
        this.resetWavepacket();
      });
    }

    const sliderV0 = document.getElementById('sch-v0');
    if (sliderV0) {
      sliderV0.addEventListener('input', (e) => {
        this.barrierHeight = parseFloat(e.target.value);
        const tag = document.getElementById('val-sch-v0');
        if (tag) tag.textContent = `${this.barrierHeight} eV`;
        this.initPotential();
      });
    }

    const sliderK = document.getElementById('sch-k0');
    if (sliderK) {
      sliderK.addEventListener('input', (e) => {
        this.waveMomentum = parseFloat(e.target.value);
        const tag = document.getElementById('val-sch-k0');
        if (tag) tag.textContent = this.waveMomentum.toFixed(2);
        this.resetWavepacket();
      });
    }

    const btnPlay = document.getElementById('sch-btn-play');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        this.isRunning = !this.isRunning;
        btnPlay.innerHTML = this.isRunning ? '⏸ Pause' : '▶ Play';
      });
    }

    const btnReset = document.getElementById('sch-btn-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.resetWavepacket();
      });
    }
  }

  animate() {
    if (this.isRunning) {
      for (let s = 0; s < 3; s++) this.stepTime();
    }

    const w = this.canvas.width;
    const h = this.canvas.height;
    const baseY = h * 0.72;

    this.ctx.clearRect(0, 0, w, h);

    // Axis line in clean slate
    this.ctx.strokeStyle = '#cbd5e1';
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, baseY);
    this.ctx.lineTo(w, baseY);
    this.ctx.stroke();

    const scaleX = w / this.N;
    const scaleY = h * 2.8;

    // Potential V(x) in Amber/Brass
    this.ctx.beginPath();
    this.ctx.moveTo(0, baseY);
    for (let i = 0; i < this.N; i++) {
      const px = i * scaleX;
      const py = baseY - this.potential[i] * 1.8;
      this.ctx.lineTo(px, py);
    }
    this.ctx.lineTo(w, baseY);
    this.ctx.fillStyle = 'rgba(217, 119, 6, 0.12)';
    this.ctx.fill();
    this.ctx.strokeStyle = '#d97706';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Probability Density |psi(x)|^2 in Soft Gold
    this.ctx.beginPath();
    this.ctx.moveTo(0, baseY);
    for (let i = 0; i < this.N; i++) {
      const prob = this.psiRe[i] * this.psiRe[i] + this.psiIm[i] * this.psiIm[i];
      const px = i * scaleX;
      const py = baseY - prob * scaleY;
      this.ctx.lineTo(px, py);
    }
    this.ctx.lineTo(w, baseY);
    this.ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    this.ctx.fill();

    // Real Part Re(psi) in Crimson
    this.ctx.beginPath();
    for (let i = 0; i < this.N; i++) {
      const px = i * scaleX;
      const py = baseY - this.psiRe[i] * Math.sqrt(scaleY) * 6;
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.strokeStyle = '#be123c';
    this.ctx.lineWidth = 2.2;
    this.ctx.stroke();

    // Imaginary Part Im(psi) in Slate
    this.ctx.beginPath();
    for (let i = 0; i < this.N; i++) {
      const px = i * scaleX;
      const py = baseY - this.psiIm[i] * Math.sqrt(scaleY) * 6;
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 1.6;
    this.ctx.stroke();

    requestAnimationFrame(() => this.animate());
  }
}

window.SchrodingerSimulator = SchrodingerSimulator;
