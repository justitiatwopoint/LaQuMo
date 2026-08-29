/* ==========================================================================
   LAQUMO - SIMULATOR 3: DOUBLE-SLIT INTERFERENCE (LIGHT DAYTIME SPEC)
   ========================================================================== */

class DoubleSlitSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.d = 40;
    this.a = 10;
    this.lambda = 580;
    this.particleRate = 12;
    this.totalPhotons = 0;

    this.screenHits = [];
    this.time = 0;

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

  getWavelengthColor(wl) {
    if (wl < 450) return '#6d28d9';
    if (wl < 500) return '#0284c7';
    if (wl < 550) return '#059669';
    if (wl < 600) return '#d97706';
    if (wl < 640) return '#ea580c';
    return '#be123c';
  }

  intensity(yNorm) {
    const beta = (Math.PI * this.a * yNorm * 20) / (this.lambda * 0.05);
    const alpha = (Math.PI * this.d * yNorm * 20) / (this.lambda * 0.05);

    const diffraction = beta === 0 ? 1 : Math.sin(beta) / beta;
    const interference = Math.cos(alpha);

    return (diffraction * diffraction) * (interference * interference);
  }

  samplePhotonY() {
    for (let attempt = 0; attempt < 50; attempt++) {
      const yNorm = (Math.random() - 0.5) * 2;
      const targetProb = this.intensity(yNorm);
      if (Math.random() < targetProb) {
        return yNorm;
      }
    }
    return 0;
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    const sliderD = document.getElementById('ds-slit-d');
    if (sliderD) {
      sliderD.addEventListener('input', (e) => {
        this.d = parseFloat(e.target.value);
        const tag = document.getElementById('val-ds-d');
        if (tag) tag.textContent = `${this.d} μm`;
      });
    }

    const sliderLambda = document.getElementById('ds-lambda');
    if (sliderLambda) {
      sliderLambda.addEventListener('input', (e) => {
        this.lambda = parseFloat(e.target.value);
        const tag = document.getElementById('val-ds-lambda');
        if (tag) tag.textContent = `${this.lambda} nm`;
      });
    }

    const btnClear = document.getElementById('ds-btn-clear');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.screenHits = [];
        this.totalPhotons = 0;
        const tagCount = document.getElementById('val-ds-photons');
        if (tagCount) tagCount.textContent = '0';
      });
    }
  }

  animate() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const color = this.getWavelengthColor(this.lambda);

    for (let i = 0; i < this.particleRate; i++) {
      const yNorm = this.samplePhotonY();
      const screenY = h / 2 + yNorm * (h * 0.42);
      const screenX = w - 40 + (Math.random() - 0.5) * 45;

      this.screenHits.push({ x: screenX, y: screenY });
      this.totalPhotons++;
    }

    if (this.screenHits.length > 5000) {
      this.screenHits.splice(0, this.particleRate * 2);
    }

    const tagCount = document.getElementById('val-ds-photons');
    if (tagCount) tagCount.textContent = this.totalPhotons.toLocaleString();

    this.ctx.clearRect(0, 0, w, h);

    // Section 1: Clean Slate Barrier
    const barrierX = w * 0.28;
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(barrierX - 4, 0, 8, h);

    const slit1Y = h / 2 - this.d * 0.8;
    const slit2Y = h / 2 + this.d * 0.8;
    const slitHalf = this.a * 0.6;

    this.ctx.clearRect(barrierX - 4, slit1Y - slitHalf, 8, slitHalf * 2);
    this.ctx.clearRect(barrierX - 4, slit2Y - slitHalf, 8, slitHalf * 2);

    // Incoming Slate Plane Waves
    this.time += 0.05;
    const waveSpacing = 16;
    for (let x = 10; x < barrierX - 10; x += waveSpacing) {
      const waveX = (x + this.time * 20) % (barrierX - 10);
      this.ctx.beginPath();
      this.ctx.moveTo(waveX, 20);
      this.ctx.lineTo(waveX, h - 20);
      this.ctx.strokeStyle = `rgba(100, 116, 139, 0.25)`;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    }

    // Expanding wave fronts
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(barrierX + 4, 0, w * 0.45, h);
    this.ctx.clip();

    for (let r = 10; r < 240; r += 20) {
      const waveR = (r + this.time * 20) % 240;
      this.ctx.beginPath();
      this.ctx.arc(barrierX, slit1Y, waveR, -Math.PI / 2, Math.PI / 2);
      this.ctx.strokeStyle = `rgba(217, 119, 6, ${0.35 * (1 - waveR / 240)})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(barrierX, slit2Y, waveR, -Math.PI / 2, Math.PI / 2);
      this.ctx.strokeStyle = `rgba(217, 119, 6, ${0.35 * (1 - waveR / 240)})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    }
    this.ctx.restore();

    // Section 2: Theoretical Intensity Curve
    const curveStartX = w * 0.72;
    this.ctx.beginPath();
    for (let py = 0; py < h; py++) {
      const yNorm = (py - h / 2) / (h * 0.42);
      const I = this.intensity(yNorm);
      const px = curveStartX + I * 60;
      if (py === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2.4;
    this.ctx.stroke();

    // Section 3: Phosphor Hits
    for (let i = 0; i < this.screenHits.length; i++) {
      const hit = this.screenHits[i];
      this.ctx.beginPath();
      this.ctx.arc(hit.x, hit.y, 1.4, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  }
}

window.DoubleSlitSimulator = DoubleSlitSimulator;
