/**
 * LaQuMo (Large Quantum Model) v3.0 - Monochromatic Quantum Interactive Script
 * Theme: Pitch Black, Deep Space Obsidian, Pure White & Monochromatic Grayscale
 * Features: Monochromatic Particle Network, 3D Bloch Sphere Visualizer,
 * Live Quantum AI Prompt Simulator, Code Playground, Contact Form & Deploy Guide Modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleNetwork();

  // Only run index-page Bloch Sphere animation if on index.html
  if (document.getElementById('hero')) {
    initBlochSphere();
    initCodePlayground();
  }

  initCircuitBuilder();
  initContactForm();
  initModals();
});

/* ==========================================================================
   1. Monochromatic Quantum Particle Network Canvas Animation
   ========================================================================== */
function initParticleNetwork() {
  const canvas = document.getElementById('quantum-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  let isMobile = width <= 768;
  let animFrameId = null;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    isMobile = width <= 768;
  }, { passive: true });

  const particleCount = isMobile 
    ? Math.min(16, Math.floor((width * height) / 36000)) 
    : Math.min(45, Math.floor((width * height) / 18000));
    
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4),
      vy: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4),
      radius: Math.random() * 1.8 + 0.8,
      alpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2
    });
  }

  let mouse = { x: null, y: null, radius: 120 };

  if (!isMobile) {
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      p.pulse += 0.02;
      const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.15;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const particleRgb = isDark ? '240, 242, 248' : '58, 50, 38';
      const lineRgb = isDark ? '220, 225, 240' : '96, 86, 70';

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleRgb}, ${Math.max(0.12, currentAlpha)})`;
      ctx.shadowBlur = isMobile ? 0 : (isDark ? 8 : 3);
      ctx.shadowColor = isMobile ? 'transparent' : (isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)');
      ctx.fill();

      // Entanglement Pairs (Connecting Nearby Particles - Skipped on small mobile screens for 60 FPS)
      const maxConnectDist = isMobile ? 85 : 120;
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxConnectDist * maxConnectDist) {
          const dist = Math.sqrt(distSq);
          const lineAlpha = (1 - dist / maxConnectDist) * (isDark ? 0.15 : 0.12);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${lineRgb}, ${lineAlpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // Mouse Interactivity
      if (mouse.x !== null && !isMobile) {
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < mouse.radius) {
          const force = (mouse.radius - mdist) / mouse.radius;
          p.x += (mdx / mdist) * force * 1.5;
          p.y += (mdy / mdist) * force * 1.5;
        }
      }
    }

    if (!document.hidden) {
      animFrameId = requestAnimationFrame(draw);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    } else {
      draw();
    }
  });

  draw();
}

/* ==========================================================================
   2. Bloch Sphere & Quantum State Vector Simulation
   ========================================================================== */
function initBlochSphere() {
  const canvas = document.getElementById('bloch-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Sliders
  const qubitsSlider = document.getElementById('slider-qubits');
  const depthSlider = document.getElementById('slider-depth');
  const entropySlider = document.getElementById('slider-entropy');
  const headsSlider = document.getElementById('slider-heads');

  const valQubits = document.getElementById('val-qubits');
  const valDepth = document.getElementById('val-depth');
  const valEntropy = document.getElementById('val-entropy');
  const valHeads = document.getElementById('val-heads');

  window.blochTheta = Math.PI / 4;
  window.blochPhi = Math.PI / 3;
  window.isCircuitControlled = false;
  let animTime = 0;

  function updateValues() {
    if (valQubits && qubitsSlider) valQubits.textContent = qubitsSlider.value;
    if (valDepth && depthSlider) valDepth.textContent = depthSlider.value;
    if (valEntropy && entropySlider) valEntropy.textContent = parseFloat(entropySlider.value).toFixed(2);
    if (valHeads && headsSlider) valHeads.textContent = headsSlider.value;

    if (!window.isCircuitControlled) {
      updateProbabilities(
        qubitsSlider ? parseInt(qubitsSlider.value) : 16,
        entropySlider ? parseFloat(entropySlider.value) : 0.45,
        depthSlider ? parseInt(depthSlider.value) : 12
      );
    }
  }

  if (qubitsSlider) qubitsSlider.addEventListener('input', updateValues);
  if (depthSlider) depthSlider.addEventListener('input', updateValues);
  if (entropySlider) entropySlider.addEventListener('input', updateValues);
  if (headsSlider) headsSlider.addEventListener('input', updateValues);

  function renderBlochSphere() {
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = (canvas.width = parent.clientWidth || 300);
    const h = (canvas.height = parent.clientHeight || 280);
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.35;

    ctx.clearRect(0, 0, w, h);

    animTime += 0.015;
    let targetTheta = window.blochTheta;
    let targetPhi = window.blochPhi;

    if (!window.isCircuitControlled) {
      const entropyVal = entropySlider ? parseFloat(entropySlider.value) : 0.45;
      targetTheta = window.blochTheta + Math.sin(animTime) * 0.25 * entropyVal;
      targetPhi = window.blochPhi + animTime * 0.3;
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const ringColor = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)';
    const equatorColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.15)';
    const axisColor = isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.4)';
    const textColor = isDark ? '#ffffff' : '#2B2823';

    // Outer Sphere Ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Equator Ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.strokeStyle = equatorColor;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    ctx.beginPath();
    ctx.moveTo(cx, cy - r - 15);
    ctx.lineTo(cx, cy + r + 15);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = textColor;
    ctx.font = 'bold 12px "IBM Plex Mono", monospace';
    ctx.fillText('|0⟩', cx - 8, cy - r - 12);
    ctx.fillText('|1⟩', cx - 8, cy + r + 24);
    ctx.fillText('|i+⟩', cx + r + 12, cy + 4);

    // Vector Point Calculation
    const vx = r * Math.sin(targetTheta) * Math.cos(targetPhi);
    const vy = r * Math.cos(targetTheta);
    const vz = r * Math.sin(targetTheta) * Math.sin(targetPhi);

    const px = cx + vx;
    const py = cy - vy + vz * 0.25;

    // Vector Arrow Line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = isDark ? 12 : 4;
    ctx.shadowColor = isDark ? '#ffffff' : 'rgba(0, 0, 0, 0.3)';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Endpoint Bead
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = textColor;
    ctx.fill();

    requestAnimationFrame(renderBlochSphere);
  }

  renderBlochSphere();
}

/* Update Probability Amplitudes */
function updateProbabilities(qubits, entropy, depth) {
  const p1 = Math.min(0.85, Math.max(0.05, 0.5 - entropy * 0.3 + depth * 0.015));
  const p2 = Math.min(0.7, Math.max(0.05, 0.25 + entropy * 0.2));
  const p3 = Math.min(0.5, Math.max(0.02, (1 - p1 - p2) * 0.6));
  const p4 = Math.max(0.01, 1 - p1 - p2 - p3);

  const values = [p1, p2, p3, p4];

  values.forEach((v, idx) => {
    const valEl = document.getElementById(`amp-val-${idx}`);
    const barEl = document.getElementById(`amp-bar-${idx}`);
    if (valEl && barEl) {
      const percentage = (values[idx] * 100).toFixed(1);
      valEl.textContent = `${percentage}%`;
      barEl.style.width = `${percentage}%`;
    }
  });

  const stateEquation = document.getElementById('dynamic-state-latex');
  if (stateEquation) {
    const alpha = Math.sqrt(p1).toFixed(2);
    const beta = Math.sqrt(p2).toFixed(2);
    stateEquation.innerHTML = `\\(|\\Psi_{LaQuMo}\\rangle = ${alpha}|00\\dots 0\\rangle + ${beta}e^{i\\phi}|11\\dots 1\\rangle\\)`;
    if (window.MathJax) {
      MathJax.typesetPromise([stateEquation]);
    }
  }
}

/* ==========================================================================
   3. Interactive Qubit Circuit Builder & Matrix Engine
   ========================================================================== */
/* ==========================================================================
   3. Interactive 2-Qubit Circuit Grid & Matrix Engine
   ========================================================================== */
function initCircuitBuilder() {
  const btnSelectQ0 = document.getElementById('btn-select-q0');
  const btnSelectQ1 = document.getElementById('btn-select-q1');
  const resetBtn = document.getElementById('btn-circuit-reset');
  const mathStatevector = document.getElementById('circuit-math-statevector');
  const mathProbs = document.getElementById('circuit-math-probs');

  let activeWire = 'q0';

  // 2-Qubit State Vector: 4 complex numbers for |00>, |01>, |10>, |11>
  let state = [
    { r: 1, i: 0 }, // |00>
    { r: 0, i: 0 }, // |01>
    { r: 0, i: 0 }, // |10>
    { r: 0, i: 0 }  // |11>
  ];

  let gridq0 = Array(5).fill(null);
  let gridq1 = Array(5).fill(null);
  let cnotSteps = Array(5).fill(false);

  function setActiveWire(w) {
    activeWire = w;
    if (w === 'q0') {
      if (btnSelectQ0) btnSelectQ0.classList.add('active');
      if (btnSelectQ1) btnSelectQ1.classList.remove('active');
    } else {
      if (btnSelectQ1) btnSelectQ1.classList.add('active');
      if (btnSelectQ0) btnSelectQ0.classList.remove('active');
    }
  }

  if (btnSelectQ0) btnSelectQ0.addEventListener('click', () => setActiveWire('q0'));
  if (btnSelectQ1) btnSelectQ1.addEventListener('click', () => setActiveWire('q1'));

  // Attach direct click events to grid slots
  document.querySelectorAll('.circuit-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      const wire = slot.getAttribute('data-wire');
      const step = parseInt(slot.getAttribute('data-step'));
      setActiveWire(wire);

      // If slot is occupied by CNOT or gate, clear it
      if (cnotSteps[step]) {
        cnotSteps[step] = false;
      } else if (wire === 'q0' && gridq0[step]) {
        gridq0[step] = null;
      } else if (wire === 'q1' && gridq1[step]) {
        gridq1[step] = null;
      }
      computeFullGridState();
    });
  });

  function multiplyComplex(r1, i1, r2, i2) {
    return { r: r1 * r2 - i1 * i2, i: r1 * i2 + i1 * r2 };
  }

  function applySingleGate(gate, inputPair) {
    let ca = inputPair[0], cb = inputPair[1];
    let nA = { r: ca.r, i: ca.i }, nB = { r: cb.r, i: cb.i };
    const invSqrt2 = 1 / Math.SQRT2;

    if (gate === 'H') {
      nA = { r: invSqrt2 * (ca.r + cb.r), i: invSqrt2 * (ca.i + cb.i) };
      nB = { r: invSqrt2 * (ca.r - cb.r), i: invSqrt2 * (ca.i - cb.i) };
    } else if (gate === 'X') {
      nA = { r: cb.r, i: cb.i };
      nB = { r: ca.r, i: ca.i };
    } else if (gate === 'Y') {
      nA = { r: cb.i, i: -cb.r };
      nB = { r: -ca.i, i: ca.r };
    } else if (gate === 'Z') {
      nB = { r: -cb.r, i: -cb.i };
    } else if (gate === 'S') {
      nB = { r: -cb.i, i: cb.r };
    } else if (gate === 'T') {
      const res = multiplyComplex(cb.r, cb.i, invSqrt2, invSqrt2);
      nB = res;
    }
    return [nA, nB];
  }

  function computeFullGridState() {
    let s = [
      { r: 1, i: 0 },
      { r: 0, i: 0 },
      { r: 0, i: 0 },
      { r: 0, i: 0 }
    ];

    let hasGates = false;

    for (let step = 0; step < 5; step++) {
      let g0 = gridq0[step];
      let g1 = gridq1[step];

      if (cnotSteps[step]) {
        hasGates = true;
        // CNOT (control q0, target q1): if q0 is |1> (indices 2,3), flip q1 (|10> <-> |11>)
        let temp = s[2];
        s[2] = s[3];
        s[3] = temp;
      } else {
        if (g0) {
          hasGates = true;
          let pair1 = applySingleGate(g0, [s[0], s[2]]);
          s[0] = pair1[0]; s[2] = pair1[1];
          let pair2 = applySingleGate(g0, [s[1], s[3]]);
          s[1] = pair2[0]; s[3] = pair2[1];
        }
        if (g1) {
          hasGates = true;
          let pair1 = applySingleGate(g1, [s[0], s[1]]);
          s[0] = pair1[0]; s[1] = pair1[1];
          let pair2 = applySingleGate(g1, [s[2], s[3]]);
          s[2] = pair2[0]; s[3] = pair2[1];
        }
      }
    }

    state = s;
    window.isCircuitControlled = hasGates;
    updateUI();
  }

  function addGateToGrid(gate) {
    if (gate === 'CNOT') {
      for (let step = 0; step < 5; step++) {
        if (!gridq0[step] && !gridq1[step] && !cnotSteps[step]) {
          cnotSteps[step] = true;
          break;
        }
      }
    } else {
      let targetArray = activeWire === 'q0' ? gridq0 : gridq1;
      for (let step = 0; step < 5; step++) {
        if (!targetArray[step] && !cnotSteps[step]) {
          targetArray[step] = gate;
          break;
        }
      }
    }
    computeFullGridState();
  }

  function resetGrid() {
    gridq0 = Array(5).fill(null);
    gridq1 = Array(5).fill(null);
    cnotSteps = Array(5).fill(false);
    window.isCircuitControlled = false;
    window.blochTheta = Math.PI / 4;
    window.blochPhi = Math.PI / 3;
    computeFullGridState();
  }

  function updateUI() {
    // Slot elements rendering
    for (let step = 0; step < 5; step++) {
      const slotq0 = document.querySelector(`.circuit-slot[data-wire="q0"][data-step="${step}"]`);
      const slotq1 = document.querySelector(`.circuit-slot[data-wire="q1"][data-step="${step}"]`);

      if (cnotSteps[step]) {
        if (slotq0) slotq0.innerHTML = `<div class="cnot-control-dot" title="CNOT Control Dot (q0)"></div>`;
        if (slotq1) slotq1.innerHTML = `<div class="cnot-target-symbol" title="CNOT Target Symbol (q1)">+</div>`;
      } else {
        if (slotq0) {
          slotq0.innerHTML = gridq0[step] ? `<span class="wire-gate-badge">${gridq0[step]}</span>` : `<span class="slot-placeholder">+</span>`;
        }
        if (slotq1) {
          slotq1.innerHTML = gridq1[step] ? `<span class="wire-gate-badge">${gridq1[step]}</span>` : `<span class="slot-placeholder">+</span>`;
        }
      }
    }

    // Probabilities
    const p00 = state[0].r * state[0].r + state[0].i * state[0].i;
    const p01 = state[1].r * state[1].r + state[1].i * state[1].i;
    const p10 = state[2].r * state[2].r + state[2].i * state[2].i;
    const p11 = state[3].r * state[3].r + state[3].i * state[3].i;

    // Amplitude Bars
    const setAmp = (idx, prob) => {
      const valEl = document.getElementById(`amp-val-${idx}`);
      const barEl = document.getElementById(`amp-bar-${idx}`);
      if (valEl && barEl) {
        valEl.textContent = `${(prob * 100).toFixed(1)}%`;
        barEl.style.width = `${(prob * 100).toFixed(1)}%`;
      }
    };
    setAmp(0, p00);
    setAmp(1, p01);
    setAmp(2, p10);
    setAmp(3, p11);

    // Update Amplitude basis labels
    const states = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
    document.querySelectorAll('.amplitude-box .amp-state').forEach((box, idx) => {
      if (box && states[idx]) box.textContent = states[idx];
    });

    // Bloch Sphere Vector Rotation Connection
    const normAlpha = Math.sqrt(p00 + p01);
    const newTheta = 2 * Math.acos(Math.min(1, Math.max(0, normAlpha)));
    window.blochTheta = newTheta;

    // Formatting Statevector Text
    const formatComplex = (r, i) => {
      const rStr = Math.abs(r) < 0.001 ? '0.00' : r.toFixed(3);
      const iStr = Math.abs(i) < 0.001 ? '' : (i > 0 ? `+${i.toFixed(3)}i` : `-${Math.abs(i).toFixed(3)}i`);
      return `${rStr}${iStr}`;
    };

    if (mathStatevector) {
      mathStatevector.textContent = `${formatComplex(state[0].r, state[0].i)}|00⟩ + ${formatComplex(state[1].r, state[1].i)}|01⟩ + ${formatComplex(state[2].r, state[2].i)}|10⟩ + ${formatComplex(state[3].r, state[3].i)}|11⟩`;
    }
    if (mathProbs) {
      mathProbs.textContent = `P(00)=${(p00*100).toFixed(1)}% | P(01)=${(p01*100).toFixed(1)}% | P(10)=${(p10*100).toFixed(1)}% | P(11)=${(p11*100).toFixed(1)}%`;
    }

    // Update Dynamic LaTeX Equation
    const stateEq = document.getElementById('dynamic-state-latex');
    if (stateEq) {
      stateEq.innerHTML = `\\(|\\Psi_{LaQuMo}\\rangle = ${Math.sqrt(p00).toFixed(2)}|00\\rangle + ${Math.sqrt(p01).toFixed(2)}|01\\rangle + ${Math.sqrt(p10).toFixed(2)}|10\\rangle + ${Math.sqrt(p11).toFixed(2)}|11\\rangle\\)`;
      if (window.MathJax) MathJax.typesetPromise([stateEq]);
    }
  }

  document.querySelectorAll('.gate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      addGateToGrid(btn.getAttribute('data-gate'));
    });
  });

  if (resetBtn) resetBtn.addEventListener('click', resetGrid);
}

/* ==========================================================================
   4. Developer API Code Playground
   ========================================================================== */
function initCodePlayground() {
  const codeSnippets = {
    python: `<span class="code-keyword">from</span> qiskit <span class="code-keyword">import</span> QuantumCircuit
<span class="code-keyword">from</span> qiskit.quantum_info <span class="code-keyword">import</span> Statevector

<span class="code-comment"># Initialize 4-Qubit Variational Quantum Circuit (VQC)</span>
qc = QuantumCircuit(<span class="code-func">4</span>)
qc.h(<span class="code-func">0</span>)  <span class="code-comment"># Equal superposition on Qubit 0</span>
qc.cx(<span class="code-func">0</span>, <span class="code-func">1</span>)  <span class="code-comment"># Entangle Qubit 0 and Qubit 1 (Bell Pair)</span>
qc.ry(<span class="code-func">0.785</span>, <span class="code-func">2</span>)  <span class="code-comment"># Variational rotation on Qubit 2</span>

<span class="code-comment"># Calculate exact statevector representation</span>
state = Statevector.from_instruction(qc)
print(<span class="code-str">"Statevector:"</span>, state)
print(<span class="code-str">"Probabilities:"</span>, state.probabilities_dict())`,

    pennylane: `<span class="code-keyword">import</span> pennylane <span class="code-keyword">as</span> qml
<span class="code-keyword">from</span> pennylane <span class="code-keyword">import</span> numpy <span class="code-keyword">as</span> np

<span class="code-comment"># Initialize 4-Qubit device</span>
dev = qml.device(<span class="code-str">"default.qubit"</span>, wires=<span class="code-func">4</span>)

<span class="code-keyword">@qml.qnode</span>(dev)
<span class="code-keyword">def</span> <span class="code-func">quantum_circuit</span>(params):
    qml.Hadamard(wires=<span class="code-func">0</span>)
    qml.RY(params[<span class="code-func">0</span>], wires=<span class="code-func">1</span>)
    qml.CNOT(wires=[<span class="code-func">0</span>, <span class="code-func">1</span>])
    <span class="code-keyword">return</span> qml.expval(qml.PauliZ(<span class="code-func">0</span>))

params = np.array([<span class="code-func">0.543</span>], requires_grad=<span class="code-func">True</span>)
print(<span class="code-str">"Expectation Value <Z_0>:"</span>, quantum_circuit(params))`,

    pytorch: `<span class="code-keyword">import</span> torch
<span class="code-keyword">import</span> pennylane <span class="code-keyword">as</span> qml

<span class="code-comment"># PyTorch Hybrid Quantum-Classical Layer</span>
dev = qml.device(<span class="code-str">"default.qubit"</span>, wires=<span class="code-func">2</span>)

<span class="code-keyword">@qml.qnode</span>(dev, interface=<span class="code-str">"torch"</span>)
<span class="code-keyword">def</span> <span class="code-func">qnode</span>(inputs, weights):
    qml.AngleEmbedding(inputs, wires=[<span class="code-func">0</span>, <span class="code-func">1</span>])
    qml.BasicEntanglerLayers(weights, wires=[<span class="code-func">0</span>, <span class="code-func">1</span>])
    <span class="code-keyword">return</span> [qml.expval(qml.PauliZ(i)) <span class="code-keyword">for</span> i <span class="code-keyword">in</span> range(<span class="code-func">2</span>)]

weight_shapes = {<span class="code-str">"weights"</span>: (<span class="code-func">2</span>, <span class="code-func">2</span>)}
qlayer = qml.qnn.TorchLayer(qnode, weight_shapes)

x = torch.tensor([<span class="code-func">0.1</span>, <span class="code-func">0.2</span>])
print(<span class="code-str">"Hybrid Layer Output:"</span>, qlayer(x))`
  };

  const tabs = document.querySelectorAll('.code-tab');
  const codeContent = document.getElementById('code-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const lang = tab.getAttribute('data-lang');
      if (codeContent && codeSnippets[lang]) {
        codeContent.innerHTML = codeSnippets[lang];
      }
    });
  });

  // Copy Code Button
  const copyBtn = document.getElementById('btn-copy-code');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const textToCopy = codeContent.innerText;
      navigator.clipboard.writeText(textToCopy).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      });
    });
  }
}

/* ==========================================================================
   5. Interactive Contact Form
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-feedback');

  if (!form || !feedback) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value;

    feedback.className = 'form-feedback-simple success';
    feedback.innerHTML = `✓ Thank you, ${name}! Your message has been sent to <strong>info@laqumo.com</strong>. We will get back to you shortly.`;

    form.reset();
    setTimeout(() => {
      feedback.style.opacity = '0';
      setTimeout(() => {
        feedback.className = 'form-feedback-simple';
        feedback.innerHTML = '';
        feedback.style.opacity = '1';
      }, 400);
    }, 5000);
  });
}

/* ==========================================================================
   6. Modals & GitHub Deploy Guide Helper
   ========================================================================== */
function initModals() {
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');

  if (modalClose && modalBackdrop) {
    modalClose.addEventListener('click', () => {
      modalBackdrop.classList.remove('active');
    });
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) modalBackdrop.classList.remove('active');
    });
  }

  // Publication Abstract trigger
  document.querySelectorAll('.btn-read-pub').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = btn.getAttribute('data-title');
      const abstract = btn.getAttribute('data-abstract');

      if (modalTitle) modalTitle.textContent = title;
      if (modalBody) modalBody.innerHTML = `<p style="line-height:1.7; color:#9aa0b4;">${abstract}</p><br><div class="math-block" style="width:100%;">BibTeX Citation:<br><code style="font-size:0.8rem; color:#ffffff;">@article{laqumo2026,<br>&nbsp;&nbsp;title={LaQuMo: Large Quantum Model for Molecular Dynamics and Cryptography},<br>&nbsp;&nbsp;author={LaQuMo Research Collective},<br>&nbsp;&nbsp;journal={Quantum AI Review},<br>&nbsp;&nbsp;year={2026}<br>}</code></div>`;

      if (modalBackdrop) modalBackdrop.classList.add('active');
      if (window.MathJax) MathJax.typesetPromise([modalBody]);
    });
  });

  // GitHub Deploy Guide Helper Button
  const btnDeployGuide = document.getElementById('btn-deploy-guide');
  if (btnDeployGuide) {
    btnDeployGuide.addEventListener('click', () => {
      if (modalTitle) modalTitle.textContent = 'GitHub Pages & Custom Domain Setup';
      if (modalBody) {
        modalBody.innerHTML = `
          <p style="font-size:0.9rem; color:#9aa0b4; margin-bottom:16px;">
            To host LaQuMo directly on <strong style="color:#ffffff;">GitHub Pages</strong> with your 3rd-party domain:
          </p>
          <ol style="font-size:0.85rem; color:#9aa0b4; margin-left:20px; line-height:1.8;">
            <li>Push repository to GitHub: <code style="color:#ffffff; background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px;">git push -u origin main</code></li>
            <li>Go to <strong style="color:#ffffff;">Settings &gt; Pages</strong> in GitHub and set Source branch to <code style="color:#ffffff;">main</code>.</li>
            <li>Add 4 Apex <strong style="color:#ffffff;">A Records</strong> in your domain registrar:
              <br><code style="color:#ffffff; font-size:0.78rem;">185.199.108.153 | 185.199.109.153 | 185.199.110.153 | 185.199.111.153</code>
            </li>
            <li>Add 1 <strong style="color:#ffffff;">CNAME Record</strong>: <code style="color:#ffffff; font-size:0.78rem;">www -&gt; username.github.io</code></li>
            <li>Enter your custom domain in GitHub Pages settings and check <strong style="color:#ffffff;">Enforce HTTPS</strong>.</li>
          </ol>
          <div style="margin-top:20px;">
            <a href="GITHUB_PAGES_DOMAIN_GUIDE.md" target="_blank" class="btn btn-outline btn-sm" style="width:100%; text-align:center;">Read Full GITHUB_PAGES_DOMAIN_GUIDE.md</a>
          </div>
        `;
      }
      if (modalBackdrop) modalBackdrop.classList.add('active');
    });
  }
}
