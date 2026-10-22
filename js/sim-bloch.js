/* ==========================================================================
   LAQUMO - SIMULATOR 1: 3D BLOCH SPHERE (LIGHT DAYTIME SPEC)
   ========================================================================== */

class BlochSphereSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.theta = Math.PI / 3; // 60 deg
    this.phi = Math.PI / 4;   // 45 deg

    this.rotX = 0.35;
    this.rotY = 0.55;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.radius = 120;
    this.initEvents();
    this.resize();
    this.updateReadouts();
    this.animate();
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const parent = this.canvas.parentElement;
    const w = parent.clientWidth || 400;
    const h = parent.clientHeight || 320;

    if (w > 0 && h > 0 && (this.canvas.width !== w || this.canvas.height !== h)) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.radius = Math.min(w, h) * 0.36;
    }
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.rotY += dx * 0.01;
      this.rotX += dy * 0.01;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.lastMouseX;
      const dy = e.touches[0].clientY - this.lastMouseY;
      this.rotY += dx * 0.01;
      this.rotX += dy * 0.01;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    const sliderTheta = document.getElementById('bloch-theta');
    const sliderPhi = document.getElementById('bloch-phi');

    if (sliderTheta) {
      sliderTheta.addEventListener('input', (e) => {
        this.theta = (parseFloat(e.target.value) * Math.PI) / 180;
        this.updateReadouts();
      });
    }

    if (sliderPhi) {
      sliderPhi.addEventListener('input', (e) => {
        this.phi = (parseFloat(e.target.value) * Math.PI) / 180;
        this.updateReadouts();
      });
    }

    const gateButtons = document.querySelectorAll('[data-gate]');
    gateButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gate = e.currentTarget.getAttribute('data-gate');
        this.applyGate(gate);
      });
    });
  }

  applyGate(gate) {
    switch (gate) {
      case 'X':
        this.theta = Math.PI - this.theta;
        this.phi = -this.phi;
        break;
      case 'Y':
        this.theta = Math.PI - this.theta;
        this.phi = Math.PI - this.phi;
        break;
      case 'Z':
        this.phi = this.phi + Math.PI;
        break;
      case 'H':
        if (Math.abs(this.theta) < 0.05) {
          this.theta = Math.PI / 2;
          this.phi = 0;
        } else if (Math.abs(this.theta - Math.PI) < 0.05) {
          this.theta = Math.PI / 2;
          this.phi = Math.PI;
        } else {
          this.theta = Math.PI / 2;
          this.phi = 0;
        }
        break;
      case 'S':
        this.phi += Math.PI / 2;
        break;
      case 'T':
        this.phi += Math.PI / 4;
        break;
      case 'RESET_0':
        this.theta = 0;
        this.phi = 0;
        break;
      case 'RESET_1':
        this.theta = Math.PI;
        this.phi = 0;
        break;
    }

    while (this.phi > Math.PI * 2) this.phi -= Math.PI * 2;
    while (this.phi < 0) this.phi += Math.PI * 2;

    const sliderTheta = document.getElementById('bloch-theta');
    const sliderPhi = document.getElementById('bloch-phi');
    if (sliderTheta) sliderTheta.value = Math.round((this.theta * 180) / Math.PI);
    if (sliderPhi) sliderPhi.value = Math.round((this.phi * 180) / Math.PI);

    this.updateReadouts();
  }

  updateReadouts() {
    const prob0 = Math.cos(this.theta / 2) ** 2;
    const prob1 = Math.sin(this.theta / 2) ** 2;

    const alphaReal = Math.cos(this.theta / 2).toFixed(3);
    const betaReal = (Math.sin(this.theta / 2) * Math.cos(this.phi)).toFixed(3);
    const betaImag = (Math.sin(this.theta / 2) * Math.sin(this.phi)).toFixed(3);

    const tagTheta = document.getElementById('val-theta');
    const tagPhi = document.getElementById('val-phi');
    const bar0 = document.getElementById('bloch-bar-0');
    const bar1 = document.getElementById('bloch-bar-1');
    const val0 = document.getElementById('bloch-prob-0');
    const val1 = document.getElementById('bloch-prob-1');
    const stateFormula = document.getElementById('bloch-state-formula');

    if (tagTheta) tagTheta.textContent = `${Math.round((this.theta * 180) / Math.PI)}°`;
    if (tagPhi) tagPhi.textContent = `${Math.round((this.phi * 180) / Math.PI)}°`;

    if (bar0) bar0.style.width = `${(prob0 * 100).toFixed(1)}%`;
    if (bar1) bar1.style.width = `${(prob1 * 100).toFixed(1)}%`;
    if (val0) val0.textContent = `${(prob0 * 100).toFixed(1)}%`;
    if (val1) val1.textContent = `${(prob1 * 100).toFixed(1)}%`;

    if (stateFormula) {
      stateFormula.innerHTML = `|&psi;&rang; = ${alphaReal}|0&rang; + (${betaReal} + ${betaImag}i)|1&rang;`;
    }
  }

  project3D(x, y, z) {
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);

    const x1 = x * cosY + z * sinY;
    const y1 = y;
    const z1 = -x * sinY + z * cosY;

    const x2 = x1;
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX;

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    return {
      x: cx + x2 * this.radius,
      y: cy - y2 * this.radius,
      z: z2
    };
  }

  drawCircle3D(plane, radius = 1, color = 'rgba(71, 85, 105, 0.25)', dashed = false) {
    this.ctx.beginPath();
    if (dashed) this.ctx.setLineDash([3, 4]);
    else this.ctx.setLineDash([]);

    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      let x = 0, y = 0, z = 0;
      if (plane === 'xy') { x = Math.cos(angle) * radius; y = Math.sin(angle) * radius; }
      if (plane === 'xz') { x = Math.cos(angle) * radius; z = Math.sin(angle) * radius; }
      if (plane === 'yz') { y = Math.cos(angle) * radius; z = Math.sin(angle) * radius; }

      const p = this.project3D(x, y, z);
      if (i === 0) this.ctx.moveTo(p.x, p.y);
      else this.ctx.lineTo(p.x, p.y);
    }
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.2;
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  drawAxis(x, y, z, label, color) {
    const start = this.project3D(-x * 1.15, -y * 1.15, -z * 1.15);
    const end = this.project3D(x * 1.15, y * 1.15, z * 1.15);

    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.4;
    this.ctx.stroke();

    this.ctx.font = 'bold 11px "IBM Plex Mono", monospace';
    this.ctx.fillStyle = color;
    this.ctx.fillText(label, end.x + 6, end.y - 4);
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Outer Sphere Boundary (Silver/Slate)
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, this.radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
    this.ctx.lineWidth = 1.6;
    this.ctx.stroke();

    // Equator and Meridian circles
    this.drawCircle3D('xz', 1, 'rgba(217, 119, 6, 0.45)'); // Warm Gold Equator
    this.drawCircle3D('yz', 1, 'rgba(71, 85, 105, 0.2)', true);
    this.drawCircle3D('xy', 1, 'rgba(71, 85, 105, 0.2)', true);

    // Axes
    this.drawAxis(0, 1, 0, '|0⟩ (+Z)', '#b45309');
    this.drawAxis(0, -1, 0, '|1⟩ (-Z)', '#be123c');
    this.drawAxis(1, 0, 0, '|+⟩ (+X)', '#475569');
    this.drawAxis(0, 0, 1, '|+i⟩ (+Y)', '#475569');

    // Quantum State Vector
    const sx = Math.sin(this.theta) * Math.cos(this.phi);
    const sy = Math.cos(this.theta);
    const sz = Math.sin(this.theta) * Math.sin(this.phi);

    const origin = this.project3D(0, 0, 0);
    const statePos = this.project3D(sx, sy, sz);

    // Crimson State Vector
    this.ctx.beginPath();
    this.ctx.moveTo(origin.x, origin.y);
    this.ctx.lineTo(statePos.x, statePos.y);
    this.ctx.strokeStyle = '#e11d48';
    this.ctx.lineWidth = 3.2;
    this.ctx.stroke();

    // Head dot (Gold with crisp white border)
    this.ctx.beginPath();
    this.ctx.arc(statePos.x, statePos.y, 6, 0, Math.PI * 2);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Projection
    const projPos = this.project3D(sx, 0, sz);
    this.ctx.beginPath();
    this.ctx.setLineDash([2, 3]);
    this.ctx.moveTo(statePos.x, statePos.y);
    this.ctx.lineTo(projPos.x, projPos.y);
    this.ctx.lineTo(origin.x, origin.y);
    this.ctx.strokeStyle = 'rgba(217, 119, 6, 0.5)';
    this.ctx.lineWidth = 1.2;
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    requestAnimationFrame(() => this.animate());
  }
}

window.BlochSphereSimulator = BlochSphereSimulator;
