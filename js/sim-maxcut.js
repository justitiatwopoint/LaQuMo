/**
 * LaQuMo Real Max-Cut QAOA Simulation Engine
 * File: js/sim-maxcut.js
 * 
 * Converted from Python maxcut_qaoa_solver.py (Farhi et al., 2014).
 * Implements 16-dimensional statevector simulation for 4-node ring graph Max-Cut partition.
 * Applies cost unitary U(H_C, gamma) = exp(-i gamma H_C) and mixer unitary U(H_M, beta) = exp(-i beta H_M),
 * computes expectation value <C> by amplitude-squared probabilities, and renders interactive graph canvas.
 */

class MaxCutQAOASimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.DIM = 16;
    this.edges = [[0, 1], [1, 2], [2, 3], [3, 0]];
    this.numNodes = 4;
    this.maxCut = 4.0;

    this.gamma = 0.7854; // Optimal gamma = pi / 4
    this.beta = 0.3927;  // Optimal beta = pi / 8

    this.initControls();
    this.resize();
    this.update();

    window.addEventListener('resize', () => this.resize());
  }

  initControls() {
    this.sliderGamma = document.getElementById('qaoa-gamma');
    this.sliderBeta = document.getElementById('qaoa-beta');
    this.valGamma = document.getElementById('val-qaoa-gamma');
    this.valBeta = document.getElementById('val-qaoa-beta');

    this.cutOut = document.getElementById('qaoa-cut-tag');
    this.ratioOut = document.getElementById('qaoa-ratio-tag');
    this.partitionOut = document.getElementById('qaoa-partition-tag');
    this.btnOptimize = document.getElementById('qaoa-btn-optimize');

    if (this.sliderGamma) {
      this.sliderGamma.addEventListener('input', (e) => {
        this.gamma = parseFloat(e.target.value);
        this.update();
      });
    }

    if (this.sliderBeta) {
      this.sliderBeta.addEventListener('input', (e) => {
        this.beta = parseFloat(e.target.value);
        this.update();
      });
    }

    if (this.btnOptimize) {
      this.btnOptimize.addEventListener('click', () => {
        this.runOptimizer();
      });
    }
  }

  classicalCut(x) {
    let cut = 0;
    for (let i = 0; i < this.edges.length; i++) {
      const u = (x >> (3 - this.edges[i][0])) & 1;
      const v = (x >> (3 - this.edges[i][1])) & 1;
      if (u !== v) cut++;
    }
    return cut;
  }

  // Exact 16D Quantum Statevector Calculation
  calculateStatevector(gamma, beta) {
    // 1. Initial State |+⟩^4 = 1/sqrt(16)
    let state = [];
    const invSqrt16 = 0.25;
    for (let i = 0; i < this.DIM; i++) {
      state.push({ r: invSqrt16, i: 0.0 });
    }

    // 2. Cost Unitary U(H_C, gamma) = exp(-i gamma H_C)
    for (let x = 0; x < this.DIM; x++) {
      const cut = this.classicalCut(x);
      const cosG = Math.cos(-gamma * cut);
      const sinG = Math.sin(-gamma * cut);
      const re = state[x].r, im = state[x].i;
      state[x] = {
        r: re * cosG - im * sinG,
        i: re * sinG + im * cosG
      };
    }

    // 3. Mixer Unitary U(H_M, beta) = exp(-i beta X) on each qubit
    const cb = Math.cos(beta);
    const sb = -Math.sin(beta); // -i sin(beta)

    for (let q = 0; q < this.numNodes; q++) {
      const mask = 1 << (3 - q);
      let nextState = new Array(this.DIM);
      for (let i = 0; i < this.DIM; i++) nextState[i] = { r: 0.0, i: 0.0 };

      for (let x = 0; x < this.DIM; x++) {
        const xFlip = x ^ mask;
        const re = state[x].r, im = state[x].i;
        
        nextState[x].r += re * cb;
        nextState[x].i += im * cb;

        nextState[xFlip].r += -im * sb;
        nextState[xFlip].i += re * sb;
      }
      state = nextState;
    }

    // 4. Measure Expected Cut Value <C> = sum_x |c_x|^2 * Cut(x)
    let expectedCut = 0.0;
    let bitProbs = [];
    for (let x = 0; x < this.DIM; x++) {
      const prob = state[x].r * state[x].r + state[x].i * state[x].i;
      expectedCut += prob * this.classicalCut(x);
      bitProbs.push({ x: x, prob: prob, cut: this.classicalCut(x) });
    }

    bitProbs.sort((a, b) => b.prob - a.prob);

    return {
      expectedCut: expectedCut,
      bitProbs: bitProbs
    };
  }

  runOptimizer() {
    let bestCut = -1;
    let bestG = 0.7854;
    let bestB = 0.3927;

    const stepsG = 80;
    const stepsB = 80;

    for (let i = 0; i <= stepsG; i++) {
      const g = (i / stepsG) * Math.PI;
      for (let j = 0; j <= stepsB; j++) {
        const b = (j / stepsB) * (Math.PI / 2.0);
        const res = this.calculateStatevector(g, b);
        if (res.expectedCut > bestCut) {
          bestCut = res.expectedCut;
          bestG = g;
          bestB = b;
        }
      }
    }

    this.gamma = bestG;
    this.beta = bestB;
    if (this.sliderGamma) this.sliderGamma.value = bestG;
    if (this.sliderBeta) this.sliderBeta.value = bestB;
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
    const degG = ((this.gamma * 180) / Math.PI).toFixed(1);
    const degB = ((this.beta * 180) / Math.PI).toFixed(1);

    if (this.valGamma) this.valGamma.textContent = `${this.gamma.toFixed(3)} rad (${degG}°)`;
    if (this.valBeta) this.valBeta.textContent = `${this.beta.toFixed(3)} rad (${degB}°)`;

    const res = this.calculateStatevector(this.gamma, this.beta);
    const cut = res.expectedCut;

    if (this.cutOut) this.cutOut.textContent = `${cut.toFixed(4)} / 4.0`;
    if (this.ratioOut) this.ratioOut.textContent = `${((cut / 4.0) * 100).toFixed(2)}% (GW Bound: 87.856%)`;

    const topState = res.bitProbs[0];
    const topStr = topState.x.toString(2).padStart(4, '0');
    if (this.partitionOut) {
      this.partitionOut.textContent = `Top Bitstring |${topStr}⟩ → Cut=${topState.cut}/4 (${(topState.prob * 100).toFixed(1)}% Prob)`;
    }

    this.draw(res);
  }

  draw(res) {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    if (!res) res = this.calculateStatevector(this.gamma, this.beta);

    const topState = res.bitProbs[0];
    const bstr = topState.x.toString(2).padStart(4, '0');

    const nodes = [
      { x: w * 0.28, y: h * 0.3, set: bstr[0] === '0' ? 'A' : 'B', label: '0' },
      { x: w * 0.72, y: h * 0.3, set: bstr[1] === '0' ? 'A' : 'B', label: '1' },
      { x: w * 0.72, y: h * 0.7, set: bstr[2] === '0' ? 'A' : 'B', label: '2' },
      { x: w * 0.28, y: h * 0.7, set: bstr[3] === '0' ? 'A' : 'B', label: '3' },
    ];

    // Draw Edges
    this.edges.forEach(([u, v]) => {
      const n1 = nodes[u];
      const n2 = nodes[v];
      const isCut = n1.set !== n2.set;

      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.strokeStyle = isCut ? '#10b981' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isCut ? 3.5 : 1.5;
      if (!isCut) ctx.setLineDash([5, 5]);
      else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw Nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = n.set === 'A' ? '#e11d48' : '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "IBM Plex Mono", Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, n.x, n.y);
    });

    // Draw Probability Histogram Bar Overlay (Top 4 states)
    const barX = w * 0.85;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(barX - 10, 20, w * 0.14, h - 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "IBM Plex Mono", Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TOP STATES', barX + (w * 0.07) - 10, 34);

    for (let idx = 0; idx < Math.min(4, res.bitProbs.length); idx++) {
      const item = res.bitProbs[idx];
      const sStr = item.x.toString(2).padStart(4, '0');
      const yPos = 60 + idx * 45;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'left';
      ctx.fillText(`|${sStr}⟩`, barX - 5, yPos);

      const maxBarW = (w * 0.12) - 10;
      const barW = item.prob * maxBarW;

      ctx.fillStyle = item.cut === 4 ? '#10b981' : '#f59e0b';
      ctx.fillRect(barX - 5, yPos + 6, Math.max(barW, 2), 8);
    }
  }
}

// Export for global lab use
window.MaxCutQAOASimulator = MaxCutQAOASimulator;
