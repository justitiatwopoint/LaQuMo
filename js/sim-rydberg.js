/* ==========================================================================
   LAQUMO - SIMULATOR 5: 2D NEUTRAL-ATOM RYDBERG LATTICE (QUERA AQUILA SPEC)
   Interactive Optical Laser Tweezers, Rabi Frequency Ω(t), Detuning Δ(t)
   and Rydberg Blockade Radius Rb = (C6 / Ω)^(1/6)
   ========================================================================== */

class RydbergLatticeSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.rows = 4;
    this.cols = 6;
    this.spacing = 50;
    this.rabiFrequency = 2.5; // MHz (Ω)
    this.detuning = 1.2;     // MHz (Δ)
    this.C6 = 862000;        // Rydberg C6 coefficient for Rb-87 |70S>
    this.blockadeRadius = 42; // px

    this.atoms = [];
    this.selectedAtom = null;
    this.time = 0;
    this.isPulsing = true;

    this.initLattice();
    this.initEvents();
    this.resize();
    this.animate();
  }

  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    const parent = this.canvas.parentElement;
    const w = parent.clientWidth || 600;
    const h = parent.clientHeight || 380;

    if (w > 0 && h > 0) {
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
      }
      this.initLattice();
    }
  }

  initLattice() {
    this.atoms = [];
    const w = this.canvas.width;
    const h = this.canvas.height;
    const startX = (w - (this.cols - 1) * this.spacing) / 2;
    const startY = (h - (this.rows - 1) * this.spacing) / 2;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.atoms.push({
          id: `atom-${r}-${c}`,
          x: startX + c * this.spacing,
          y: startY + r * this.spacing,
          baseX: startX + c * this.spacing,
          baseY: startY + r * this.spacing,
          state: 'g', // 'g' ground |g>, 'r' Rydberg excited |r>
          phase: Math.random() * Math.PI * 2,
          isExcited: false,
          isDragging: false
        });
      }
    }
    this.updateRydbergBlockade();
  }

  updateRydbergBlockade() {
    // Rb = (C6 / Ω)^(1/6) mapped to canvas pixels
    this.blockadeRadius = Math.min(85, Math.max(25, 36 * Math.pow(4.0 / (this.rabiFrequency || 0.1), 1 / 6)));
    
    const tagRb = document.getElementById('val-rydberg-rb');
    if (tagRb) tagRb.textContent = `${(this.blockadeRadius * 0.18).toFixed(1)} μm`;

    // Solve for ground vs Rydberg excitation based on blockade radius
    this.atoms.forEach((atom, i) => {
      let isBlocked = false;
      for (let j = 0; j < i; j++) {
        const other = this.atoms[j];
        if (other.isExcited) {
          const dist = Math.hypot(atom.x - other.x, atom.y - other.y);
          if (dist < this.blockadeRadius) {
            isBlocked = true;
            break;
          }
        }
      }
      // Probabilistic excitation based on detuning & non-blocked condition
      if (!isBlocked && this.detuning > 0 && Math.sin(this.time * 2 + atom.phase) > 0.1) {
        atom.isExcited = true;
      } else {
        atom.isExcited = false;
      }
    });

    const excitedCount = this.atoms.filter(a => a.isExcited).length;
    const tagCount = document.getElementById('val-rydberg-excited');
    if (tagCount) tagCount.textContent = `${excitedCount} / ${this.atoms.length} Atoms`;
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    const sliderRabi = document.getElementById('slider-rabi');
    if (sliderRabi) {
      sliderRabi.addEventListener('input', (e) => {
        this.rabiFrequency = parseFloat(e.target.value);
        const tag = document.getElementById('val-rabi');
        if (tag) tag.textContent = `${this.rabiFrequency.toFixed(1)} rad/μs`;
        this.updateRydbergBlockade();
      });
    }

    const sliderDelta = document.getElementById('slider-delta');
    if (sliderDelta) {
      sliderDelta.addEventListener('input', (e) => {
        this.detuning = parseFloat(e.target.value);
        const tag = document.getElementById('val-delta');
        if (tag) tag.textContent = `${this.detuning.toFixed(1)} rad/μs`;
        this.updateRydbergBlockade();
      });
    }

    // Drag-and-drop atom optical tweezers
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      for (let atom of this.atoms) {
        if (Math.hypot(atom.x - mouseX, atom.y - mouseY) < 18) {
          this.selectedAtom = atom;
          atom.isDragging = true;
          break;
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.selectedAtom && this.selectedAtom.isDragging) {
        const rect = this.canvas.getBoundingClientRect();
        this.selectedAtom.x = Math.max(20, Math.min(this.canvas.width - 20, e.clientX - rect.left));
        this.selectedAtom.y = Math.max(20, Math.min(this.canvas.height - 20, e.clientY - rect.top));
        this.updateRydbergBlockade();
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.selectedAtom) {
        this.selectedAtom.isDragging = false;
        this.selectedAtom = null;
      }
    });
  }

  animate() {
    this.time += 0.04;
    this.updateRydbergBlockade();

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // 1. Draw Optical Tweezer Laser Beams (Vertical Guides)
    this.ctx.lineWidth = 1;
    this.atoms.forEach(atom => {
      this.ctx.strokeStyle = 'rgba(217, 119, 6, 0.08)';
      this.ctx.beginPath();
      this.ctx.moveTo(atom.x, 0);
      this.ctx.lineTo(atom.x, h);
      this.ctx.stroke();

      this.ctx.strokeStyle = 'rgba(225, 29, 72, 0.08)';
      this.ctx.beginPath();
      this.ctx.moveTo(0, atom.y);
      this.ctx.lineTo(w, atom.y);
      this.ctx.stroke();
    });

    // 2. Draw Rydberg Blockade Radii for Excited Atoms
    this.atoms.forEach(atom => {
      if (atom.isExcited) {
        this.ctx.beginPath();
        this.ctx.arc(atom.x, atom.y, this.blockadeRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(225, 29, 72, 0.12)';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(225, 29, 72, 0.45)';
        this.ctx.setLineDash([4, 4]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }
    });

    // 3. Draw Entanglement Interactions Between Non-Blocked Pairs
    for (let i = 0; i < this.atoms.length; i++) {
      for (let j = i + 1; j < this.atoms.length; j++) {
        const a1 = this.atoms[i];
        const a2 = this.atoms[j];
        const dist = Math.hypot(a1.x - a2.x, a1.y - a2.y);

        if (dist <= this.spacing * 1.3) {
          this.ctx.beginPath();
          this.ctx.moveTo(a1.x, a1.y);
          this.ctx.lineTo(a2.x, a2.y);
          this.ctx.strokeStyle = (a1.isExcited && a2.isExcited) 
            ? 'rgba(225, 29, 72, 0.6)' 
            : 'rgba(15, 23, 42, 0.1)';
          this.ctx.lineWidth = (a1.isExcited && a2.isExcited) ? 2 : 1;
          this.ctx.stroke();
        }
      }
    }

    // 4. Draw Trapped Neutral Rubidium Atoms |g> / |r>
    this.atoms.forEach(atom => {
      // Optical Tweezer Waist Focus
      this.ctx.beginPath();
      this.ctx.arc(atom.x, atom.y, 14, 0, Math.PI * 2);
      this.ctx.fillStyle = atom.isExcited 
        ? 'rgba(225, 29, 72, 0.25)' 
        : 'rgba(217, 119, 6, 0.15)';
      this.ctx.fill();

      // Atom Core
      this.ctx.beginPath();
      this.ctx.arc(atom.x, atom.y, atom.isExcited ? 8 : 6, 0, Math.PI * 2);
      this.ctx.fillStyle = atom.isExcited ? '#e11d48' : '#d97706';
      this.ctx.fill();
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      // State Label
      this.ctx.font = '10px "IBM Plex Mono", monospace';
      this.ctx.fillStyle = atom.isExcited ? '#9f1239' : '#b45309';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(atom.isExcited ? '|r⟩' : '|g⟩', atom.x, atom.y - 12);
    });

    requestAnimationFrame(() => this.animate());
  }
}

window.RydbergLatticeSimulator = RydbergLatticeSimulator;
