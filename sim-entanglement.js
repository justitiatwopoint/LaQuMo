/* ==========================================================================
   SIMULATOR 4: 2-QUBIT ENTANGLEMENT & VON NEUMANN ENTROPY
   ========================================================================== */

class EntanglementSimulator {
  constructor() {
    this.stateType = 'bell_phi_plus';
    this.theta = Math.PI / 4; // Maximally entangled by default (45 deg)
    this.phi = 0;

    this.initEvents();
    this.update();
  }

  calculateState() {
    let a00 = 0, a01 = 0, a10 = 0, a11 = 0;

    if (this.stateType === 'bell_phi_plus') {
      a00 = 1 / Math.SQRT2; a11 = 1 / Math.SQRT2;
    } else if (this.stateType === 'bell_phi_minus') {
      a00 = 1 / Math.SQRT2; a11 = -1 / Math.SQRT2;
    } else if (this.stateType === 'bell_psi_plus') {
      a01 = 1 / Math.SQRT2; a10 = 1 / Math.SQRT2;
    } else if (this.stateType === 'bell_psi_minus') {
      a01 = 1 / Math.SQRT2; a10 = -1 / Math.SQRT2;
    } else if (this.stateType === 'product_00') {
      a00 = 1;
    } else if (this.stateType === 'custom') {
      a00 = Math.cos(this.theta);
      a11 = Math.sin(this.theta);
    }

    const p00 = a00 * a00;
    const p01 = a01 * a01;
    const p10 = a10 * a10;
    const p11 = a11 * a11;

    // Reduced density matrix eigenvalues for Qubit A
    const lambda1 = p00 + p01;
    const lambda2 = p10 + p11;

    // Von Neumann Entanglement Entropy S(rho_A) = - sum lambda_i log2(lambda_i)
    let entropy = 0;
    if (lambda1 > 1e-7) entropy -= lambda1 * Math.log2(lambda1);
    if (lambda2 > 1e-7) entropy -= lambda2 * Math.log2(lambda2);

    return {
      p00, p01, p10, p11,
      entropy: Math.min(1.0, Math.max(0.0, entropy)),
      lambda1, lambda2
    };
  }

  update() {
    const res = this.calculateState();

    // Update UI Probability Bars
    const elP00 = document.getElementById('ent-prob-00');
    const elP01 = document.getElementById('ent-prob-01');
    const elP10 = document.getElementById('ent-prob-10');
    const elP11 = document.getElementById('ent-prob-11');

    const bar00 = document.getElementById('ent-bar-00');
    const bar01 = document.getElementById('ent-bar-01');
    const bar10 = document.getElementById('ent-bar-10');
    const bar11 = document.getElementById('ent-bar-11');

    if (elP00) elP00.textContent = `${(res.p00 * 100).toFixed(1)}%`;
    if (elP01) elP01.textContent = `${(res.p01 * 100).toFixed(1)}%`;
    if (elP10) elP10.textContent = `${(res.p10 * 100).toFixed(1)}%`;
    if (elP11) elP11.textContent = `${(res.p11 * 100).toFixed(1)}%`;

    if (bar00) bar00.style.width = `${(res.p00 * 100).toFixed(1)}%`;
    if (bar01) bar01.style.width = `${(res.p01 * 100).toFixed(1)}%`;
    if (bar10) bar10.style.width = `${(res.p10 * 100).toFixed(1)}%`;
    if (bar11) bar11.style.width = `${(res.p11 * 100).toFixed(1)}%`;

    // Update Entropy Badge and Meter
    const elEntropy = document.getElementById('val-ent-entropy');
    const barEntropy = document.getElementById('bar-ent-entropy');
    if (elEntropy) elEntropy.textContent = `${res.entropy.toFixed(3)} ebits`;
    if (barEntropy) barEntropy.style.width = `${(res.entropy * 100).toFixed(1)}%`;

    // Update Density Matrix Cells
    const rho00 = document.getElementById('rho-00');
    const rho01 = document.getElementById('rho-01');
    const rho10 = document.getElementById('rho-10');
    const rho11 = document.getElementById('rho-11');

    if (rho00) rho00.textContent = res.lambda1.toFixed(2);
    if (rho01) rho01.textContent = '0.00';
    if (rho10) rho10.textContent = '0.00';
    if (rho11) rho11.textContent = res.lambda2.toFixed(2);
  }

  initEvents() {
    const stateButtons = document.querySelectorAll('[data-bell-state]');
    stateButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        stateButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.stateType = e.currentTarget.getAttribute('data-bell-state');
        this.update();
      });
    });

    const sliderTheta = document.getElementById('ent-slider-theta');
    if (sliderTheta) {
      sliderTheta.addEventListener('input', (e) => {
        this.stateType = 'custom';
        stateButtons.forEach(b => b.classList.remove('active'));
        this.theta = (parseFloat(e.target.value) * Math.PI) / 180;
        const tag = document.getElementById('val-ent-theta');
        if (tag) tag.textContent = `${Math.round((this.theta * 180) / Math.PI)}°`;
        this.update();
      });
    }
  }
}

window.EntanglementSimulator = EntanglementSimulator;
