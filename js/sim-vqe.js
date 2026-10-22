/**
 * LaQuMo Real VQE (Variational Quantum Eigensolver) Simulation Engine
 * File: js/sim-vqe.js
 * 
 * Two-qubit, parity-reduced H2 Hamiltonian in the STO-3G basis at R = 0.735 Angstrom
 * (the standard Qiskit-style coefficients). The ansatz
 * |Psi(theta)> = cos(theta)|01> + sin(theta)|10> is evaluated exactly via the Pauli
 * expectation values <ZI>, <IZ>, <ZZ>, <XX>, and the energy landscape is drawn live.
 * Benchmark: exact diagonalisation of the same Hamiltonian (-1.137306 Ha).
 */

class VQESimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    
    // Parity-reduced H2 / STO-3G Hamiltonian at R = 0.735 A (electronic part, Hartree)
    // H = g0*II + g1*ZI + g2*IZ + g3*ZZ + g4*XX   (no YY term after reduction)
    this.g0 = -1.052373245772859;
    this.g1 = -0.39793742484318045;  // ZI
    this.g2 = +0.39793742484318045;  // IZ
    this.g3 = -0.01128010425623538;  // ZZ
    this.g4 = +0.18093119978423156;  // XX
    this.g5 = 0.0;                   // YY: absent in this reduction

    // Nuclear repulsion at R = 0.735 A
    this.nuclearRepulsion = 0.7199689944489797;
    // Exact ground-state energy from diagonalising this same Hamiltonian
    this.exactFCI = -1.137306;

    this.theta = -1.456; // Default variational angle
    this.initControls();
    this.resize();
    this.update();

    window.addEventListener('resize', () => this.resize());
  }

  initControls() {
    this.sliderTheta = document.getElementById('vqe-theta');
    this.valTheta = document.getElementById('val-vqe-theta');
    this.energyOut = document.getElementById('vqe-energy-tag');
    this.errorOut = document.getElementById('vqe-error-tag');
    this.statusOut = document.getElementById('vqe-status-tag');
    this.pauliOut = document.getElementById('vqe-pauli-tag');
    this.btnOptimize = document.getElementById('vqe-btn-optimize');

    if (this.sliderTheta) {
      this.sliderTheta.addEventListener('input', (e) => {
        this.theta = parseFloat(e.target.value);
        this.update();
      });
    }

    if (this.btnOptimize) {
      this.btnOptimize.addEventListener('click', () => {
        this.runOptimizer();
      });
    }
  }

  // Exact Pauli Matrix Expectation Value Computation
  calculateEnergy(theta) {
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    // Statevector |Psi(theta)> = c|01> + s|10>
    // Pauli Expectation Values:
    const exp_ZI = c * c - s * s;  // cos(2th)
    const exp_IZ = -c * c + s * s; // -cos(2th)
    const exp_ZZ = -1.0;
    const exp_XX = 2.0 * c * s;     // sin(2th)
    const exp_YY = 2.0 * c * s;     // sin(2th)

    const e_elec = this.g0 + 
                   this.g1 * exp_ZI + 
                   this.g2 * exp_IZ + 
                   this.g3 * exp_ZZ + 
                   this.g4 * exp_XX + 
                   this.g5 * exp_YY;

    const totalEnergy = e_elec + this.nuclearRepulsion;

    return {
      energy: totalEnergy,
      exp_ZI: exp_ZI,
      exp_IZ: exp_IZ,
      exp_ZZ: exp_ZZ,
      exp_XX: exp_XX,
      exp_YY: exp_YY
    };
  }

  // Golden Section / Grid Optimization Search
  runOptimizer() {
    let minEnergy = Infinity;
    let minTheta = 0;
    const steps = 3000;
    
    for (let i = 0; i <= steps; i++) {
      const th = -Math.PI + (i / steps) * 2.0 * Math.PI;
      const res = this.calculateEnergy(th);
      if (res.energy < minEnergy) {
        minEnergy = res.energy;
        minTheta = th;
      }
    }

    this.theta = minTheta;
    if (this.sliderTheta) this.sliderTheta.value = minTheta;
    this.update();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width || 600;
    this.canvas.height = rect.height || 260;
    this.draw();
  }

  update() {
    const deg = ((this.theta * 180) / Math.PI).toFixed(1);
    if (this.valTheta) this.valTheta.textContent = `${this.theta.toFixed(3)} rad (${deg}°)`;

    const res = this.calculateEnergy(this.theta);

    if (this.energyOut) this.energyOut.textContent = `${res.energy.toFixed(6)} Hartree`;
    
    const errorHartree = Math.abs(res.energy - this.exactFCI);
    const errorMhartree = errorHartree * 1000.0;

    if (this.errorOut) this.errorOut.textContent = `${errorHartree.toFixed(6)} Hartree (${errorMhartree.toFixed(4)} mHartree)`;
    if (this.pauliOut) this.pauliOut.textContent = `⟨ZI⟩=${res.exp_ZI.toFixed(3)} | ⟨IZ⟩=${res.exp_IZ.toFixed(3)} | ⟨XX⟩=${res.exp_XX.toFixed(3)}`;

    if (this.statusOut) {
      if (errorMhartree <= 1.6) {
        this.statusOut.textContent = 'WITHIN CHEMICAL ACCURACY (< 1.6 mHartree)';
        this.statusOut.style.color = '#10b981';
      } else {
        this.statusOut.textContent = `ABOVE EXACT BY ${errorMhartree.toFixed(2)} mHartree`;
        this.statusOut.style.color = '#f59e0b';
      }
    }

    this.draw();
  }

  // Draw Live Energy Landscape E(theta) Canvas Curve
  draw() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Energy Mapping Bounds
    const minE = -1.25;
    const maxE = -0.05;

    const mapY = (e) => h - ((e - minE) / (maxE - minE)) * (h - 40) - 20;
    const mapX = (th) => ((th + Math.PI) / (2 * Math.PI)) * (w - 60) + 30;

    // FCI Reference Line (-1.137306 Hartree)
    const fciY = mapY(this.exactFCI);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(30, fciY);
    ctx.lineTo(w - 30, fciY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.font = '10px "IBM Plex Mono", Consolas, monospace';
    ctx.fillText('Exact (-1.1373 Hartree)', w - 180, fciY - 6);

    // Plot E(theta) Curve
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const points = 200;
    for (let i = 0; i <= points; i++) {
      const th = -Math.PI + (i / points) * 2 * Math.PI;
      const res = this.calculateEnergy(th);
      const px = mapX(th);
      const py = mapY(res.energy);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Highlight Current Theta Point
    const currentRes = this.calculateEnergy(this.theta);
    const cx = mapX(this.theta);
    const cy = mapY(currentRes.energy);

    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "IBM Plex Mono", Consolas, monospace';
    ctx.fillText(`E(θ) = ${currentRes.energy.toFixed(4)} Ha`, Math.min(cx + 10, w - 150), Math.max(cy - 10, 20));
  }
}

// Export for global lab use
window.VQESimulator = VQESimulator;
