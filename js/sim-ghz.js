/**
 * LaQuMo — 4-Qubit GHZ State & Bit-Flip Noise
 * File: js/sim-ghz.js
 *
 * Prepared state:   |Psi> = cos(theta/2)|0000> + e^{i phi} sin(theta/2)|1111>
 * Noise model:      each qubit independently undergoes a bit flip (X) with probability p
 *                   before a measurement in the computational basis.
 * Exact outcome probabilities (w = number of 1s in the bit string x):
 *   P(x) = cos^2(theta/2) p^w (1-p)^(4-w) + sin^2(theta/2) p^(4-w) (1-p)^w
 * Bit flips commute with the measurement basis, so the phase phi never affects P(x).
 * The Bloch sphere shows the prepared (noise-free) state in the two-level subspace
 * spanned by |0000> (north pole) and |1111> (south pole).
 */

class GHZNoiseSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.N = 4;
    this.shown = ['0000', '0001', '0110', '1111'];

    this.sTheta = document.getElementById('ghz-theta');
    this.sPhi = document.getElementById('ghz-phi');
    this.sNoise = document.getElementById('ghz-noise');
    this.vTheta = document.getElementById('val-ghz-theta');
    this.vPhi = document.getElementById('val-ghz-phi');
    this.vNoise = document.getElementById('val-ghz-noise');

    [this.sTheta, this.sPhi, this.sNoise].forEach(s => s && s.addEventListener('input', () => this.update()));
    window.addEventListener('resize', () => this.resize());
    new MutationObserver(() => this.draw())
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    this.resize();
    this.update();
  }

  params() {
    return {
      theta: (parseFloat(this.sTheta ? this.sTheta.value : 90) * Math.PI) / 180,
      phi: (parseFloat(this.sPhi ? this.sPhi.value : 60) * Math.PI) / 180,
      p: parseFloat(this.sNoise ? this.sNoise.value : 0)
    };
  }

  probabilities(theta, p) {
    const a2 = Math.cos(theta / 2) ** 2;
    const b2 = Math.sin(theta / 2) ** 2;
    const P = {};
    for (let i = 0; i < 2 ** this.N; i++) {
      const x = i.toString(2).padStart(this.N, '0');
      const w = x.split('').filter(c => c === '1').length;
      P[x] = a2 * p ** w * (1 - p) ** (this.N - w) + b2 * p ** (this.N - w) * (1 - p) ** w;
    }
    return P;
  }

  update() {
    const { theta, phi, p } = this.params();
    const degT = Math.round(parseFloat(this.sTheta.value));
    const degP = Math.round(parseFloat(this.sPhi.value)) % 360;
    if (this.vTheta) this.vTheta.textContent = `${degT}°`;
    if (this.vPhi) this.vPhi.textContent = `${degP}°`;
    if (this.vNoise) this.vNoise.textContent = p.toFixed(2);

    const P = this.probabilities(theta, p);
    let shownSum = 0;
    this.shown.forEach((x, i) => {
      const pct = P[x] * 100;
      shownSum += P[x];
      const v = document.getElementById(`ghz-prob-${i}`);
      const b = document.getElementById(`ghz-bar-${i}`);
      if (v) v.textContent = `${pct.toFixed(1)}%`;
      if (b) b.style.width = `${pct.toFixed(1)}%`;
    });
    const total = Object.values(P).reduce((s, v) => s + v, 0);
    const rest = document.getElementById('ghz-rest');
    if (rest) rest.innerHTML = `Other 12 basis states: ${((total - shownSum) * 100).toFixed(1)}% &middot; Total: ${(total * 100).toFixed(1)}%`;
    const agree = document.getElementById('ghz-agree');
    if (agree) agree.textContent = `${((P['0000'] + P['1111']) * 100).toFixed(1)}%`;

    const eq = document.getElementById('ghz-state-latex');
    if (eq) {
      const a = Math.cos(theta / 2), b = Math.sin(theta / 2);
      const phase = degP === 0 ? '' : `e^{i\\,${degP}^\\circ}`;
      eq.innerHTML = `\\(|\\Psi\\rangle = ${a.toFixed(3)}\\,|0000\\rangle + ${b.toFixed(3)}\\,${phase}|1111\\rangle\\)`;
      if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([eq]).catch(() => {});
    }
    this.draw();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width || 600;
    this.canvas.height = rect.height || 360;
    this.draw();
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    const cx = w / 2, cy = h / 2 + 10, r = Math.min(w, h) * 0.32;
    const { theta, phi } = this.params();
    const css = getComputedStyle(document.documentElement);
    const ink = (css.getPropertyValue('--text-primary') || '#2B2823').trim() || '#2B2823';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const faint = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(43,40,35,0.22)';
    const fainter = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(43,40,35,0.14)';

    ctx.clearRect(0, 0, w, h);

    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = faint; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.strokeStyle = fainter; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(cx, cy - r - 12); ctx.lineTo(cx, cy + r + 12);
    ctx.strokeStyle = faint; ctx.lineWidth = 1; ctx.stroke();

    ctx.fillStyle = ink;
    ctx.font = 'bold 12px "IBM Plex Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('|0000⟩', cx, cy - r - 18);
    ctx.fillText('|1111⟩', cx, cy + r + 28);
    ctx.textAlign = 'start';

    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.cos(theta);
    const z = r * Math.sin(theta) * Math.sin(phi);
    const px = cx + x, py = cy - y + z * 0.3, ex = cx + x, ey = cy + z * 0.3;

    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.lineTo(px, py);
    ctx.strokeStyle = fainter; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py);
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = ink; ctx.fill();
  }
}

window.GHZNoiseSimulator = GHZNoiseSimulator;
