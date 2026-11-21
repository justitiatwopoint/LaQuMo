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
    // Camera: +z up, +x towards the viewer (left), +y to the right — a right-handed
    // frame, so rotations turn the same way on screen as in the textbook.
    this.rotY = -2.1;
    this.anim = null;
    this.lastTrail = null;
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
        this.anim = null;
        this.theta = (parseFloat(e.target.value) * Math.PI) / 180;
        this.updateReadouts();
      });
    }

    if (sliderPhi) {
      sliderPhi.addEventListener('input', (e) => {
        this.anim = null;
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

  /* ------------------------------------------------------------------
     Gates as rotations of the Bloch vector
     Bloch vector: x = sin(theta)cos(phi), y = sin(theta)sin(phi), z = cos(theta)
     Every single-qubit gate is a rotation R_n(angle) of this vector:
       X: pi about x        Y: pi about y        Z: pi about z
       H: pi about (x + z)/sqrt(2)   ->  (x, y, z) -> (z, -y, x)
       S: pi/2 about z      T: pi/4 about z
     The arrow is animated along that rotation, so what you see is the
     path the state actually takes.
     ------------------------------------------------------------------ */
  static get GATE_ROTATIONS() {
    const r = Math.SQRT1_2;
    return {
      X: { axis: [1, 0, 0], angle: Math.PI },
      Y: { axis: [0, 1, 0], angle: Math.PI },
      Z: { axis: [0, 0, 1], angle: Math.PI },
      H: { axis: [r, 0, r], angle: Math.PI },
      S: { axis: [0, 0, 1], angle: Math.PI / 2 },
      T: { axis: [0, 0, 1], angle: Math.PI / 4 }
    };
  }

  blochVector() {
    return [
      Math.sin(this.theta) * Math.cos(this.phi),
      Math.sin(this.theta) * Math.sin(this.phi),
      Math.cos(this.theta)
    ];
  }

  // Rodrigues' rotation formula: rotate v by angle a about unit axis n
  static rotate(v, n, a) {
    const c = Math.cos(a), s = Math.sin(a);
    const d = n[0] * v[0] + n[1] * v[1] + n[2] * v[2];
    const cr = [n[1] * v[2] - n[2] * v[1], n[2] * v[0] - n[0] * v[2], n[0] * v[1] - n[1] * v[0]];
    return [0, 1, 2].map(i => v[i] * c + cr[i] * s + n[i] * d * (1 - c));
  }

  setFromVector(v) {
    const z = Math.max(-1, Math.min(1, v[2]));
    this.theta = Math.acos(z);
    // At the poles phi is undefined; keep the previous value so the slider doesn't jump
    if (Math.hypot(v[0], v[1]) > 1e-9) {
      let phi = Math.atan2(v[1], v[0]);
      if (phi < 0) phi += Math.PI * 2;
      if (phi >= Math.PI * 2 - 1e-9) phi = 0;
      this.phi = phi;
    }
  }

  syncSliders() {
    const sliderTheta = document.getElementById('bloch-theta');
    const sliderPhi = document.getElementById('bloch-phi');
    if (sliderTheta) sliderTheta.value = Math.round((this.theta * 180) / Math.PI);
    if (sliderPhi) sliderPhi.value = Math.round((this.phi * 180) / Math.PI) % 360;
  }

  // Jump straight to the end of any gate animation still running
  finishAnimation() {
    if (!this.anim) return;
    this.setFromVector(this.anim.end);
    this.anim = null;
    this.syncSliders();
    this.updateReadouts();
  }

  applyGate(gate) {
    this.finishAnimation();

    let start = this.blochVector();
    let axis, angle;
    const rot = BlochSphereSimulator.GATE_ROTATIONS[gate];

    if (rot) {
      ({ axis, angle } = rot);
    } else if (gate === 'RESET_0' || gate === 'RESET_1') {
      // Not a gate: move straight along the meridian to the chosen pole
      const target = gate === 'RESET_0' ? [0, 0, 1] : [0, 0, -1];
      const dot = start[0] * target[0] + start[1] * target[1] + start[2] * target[2];
      angle = Math.acos(Math.max(-1, Math.min(1, dot)));
      if (angle < 1e-6) return;
      let n = [start[1] * target[2] - start[2] * target[1],
               start[2] * target[0] - start[0] * target[2],
               start[0] * target[1] - start[1] * target[0]];
      let len = Math.hypot(n[0], n[1], n[2]);
      if (len < 1e-9) { n = [-Math.sin(this.phi), Math.cos(this.phi), 0]; len = 1; } // opposite pole
      axis = n.map(c => c / len);
    } else {
      return;
    }

    const end = BlochSphereSimulator.rotate(start, axis, angle);
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      this.setFromVector(end);
      this.syncSliders();
      this.updateReadouts();
      return;
    }

    const duration = 380 + 260 * (angle / Math.PI); // T is quick, a half-turn is slower
    this.anim = { start, end, axis, angle, t0: performance.now(), duration, done: 0 };
  }

  // Smooth arc of the path swept so far (independent of the frame rate)
  arcPoints(start, axis, upTo) {
    const n = Math.max(2, Math.ceil(48 * upTo / Math.PI));
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push(BlochSphereSimulator.rotate(start, axis, (upTo * i) / n));
    return pts;
  }

  stepAnimation(now) {
    const a = this.anim;
    if (!a) return;
    let u = Math.min(1, (now - a.t0) / a.duration);
    const eased = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    const v = BlochSphereSimulator.rotate(a.start, a.axis, a.angle * eased);
    a.done = a.angle * eased;
    if (u >= 1) {
      this.lastTrail = { points: this.arcPoints(a.start, a.axis, a.angle), axis: a.axis, fadeStart: now };
      this.finishAnimation();
      return;
    }
    this.setFromVector(v);
    this.updateReadouts();
  }

  updateReadouts() {
    const prob0 = Math.cos(this.theta / 2) ** 2;
    const prob1 = Math.sin(this.theta / 2) ** 2;

    const alphaReal = Math.cos(this.theta / 2).toFixed(3);

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
      const clean = (v) => (Math.abs(v) < 0.0005 ? 0 : v); // avoid showing -0.000
      const re = clean(Math.sin(this.theta / 2) * Math.cos(this.phi));
      const im = clean(Math.sin(this.theta / 2) * Math.sin(this.phi));
      const sign = im < 0 ? '&minus;' : '+';
      stateFormula.innerHTML = `|&psi;&rang; = ${alphaReal}|0&rang; + (${re.toFixed(3)} ${sign} ${Math.abs(im).toFixed(3)}i)|1&rang;`;
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

  // Physics frame (x, y, z) -> drawing frame (x, up, depth). y is mirrored so the
  // drawn frame is right-handed (see the camera note in the constructor).
  static toCanvas(v) {
    return [v[0], v[2], -v[1]];
  }

  drawPath(points, color, width) {
    if (!points || points.length < 2) return;
    this.ctx.beginPath();
    points.forEach((v, i) => {
      const c = BlochSphereSimulator.toCanvas(v);
      const p = this.project3D(c[0], c[1], c[2]);
      if (i === 0) this.ctx.moveTo(p.x, p.y); else this.ctx.lineTo(p.x, p.y);
    });
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.stroke();
  }

  drawRotationAxis(axis, alpha) {
    const c = BlochSphereSimulator.toCanvas(axis);
    const a = this.project3D(-c[0] * 1.25, -c[1] * 1.25, -c[2] * 1.25);
    const b = this.project3D(c[0] * 1.25, c[1] * 1.25, c[2] * 1.25);
    this.ctx.beginPath();
    this.ctx.setLineDash([5, 4]);
    this.ctx.moveTo(a.x, a.y);
    this.ctx.lineTo(b.x, b.y);
    this.ctx.strokeStyle = `rgba(37, 99, 235, ${0.75 * alpha})`;
    this.ctx.lineWidth = 1.6;
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  animate() {
    this.stepAnimation(performance.now());
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
    this.drawAxis(0, 0, -1, '|+i⟩ (+Y)', '#475569');

    // Quantum State Vector
    const sx = Math.sin(this.theta) * Math.cos(this.phi);
    const sy = Math.cos(this.theta);
    const sz = -Math.sin(this.theta) * Math.sin(this.phi);

    // Gate path: rotation axis and the arc the state is travelling along
    if (this.anim) {
      this.drawRotationAxis(this.anim.axis, 1);
      this.drawPath(this.arcPoints(this.anim.start, this.anim.axis, this.anim.done), 'rgba(225, 29, 72, 0.55)', 2);
    } else if (this.lastTrail) {
      const fade = 1 - (performance.now() - this.lastTrail.fadeStart) / 1400;
      if (fade <= 0) this.lastTrail = null;
      else {
        this.drawRotationAxis(this.lastTrail.axis, fade);
        this.drawPath(this.lastTrail.points, `rgba(225, 29, 72, ${0.55 * fade})`, 2);
      }
    }

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
