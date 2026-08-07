/**
 * LaQuMo (Large Quantum Model) - Scientific Interactive Script
 * Features: Monochromatic Quantum Node Canvas, Bloch Sphere State Projection,
 * Real-time Quantum Probability Amplitudes, Code Playground & Modal Handlers.
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleNetwork();
  initBlochSphere();
  initCodePlayground();
  initModals();
});

/* ==========================================================================
   1. Monochromatic Quantum Node Canvas Animation
   ========================================================================== */
function initParticleNetwork() {
  const canvas = document.getElementById('quantum-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = Math.floor((width * height) / 18000);
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.8,
      alpha: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    });
  }

  let mouse = { x: null, y: null, radius: 150 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
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

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 242, 248, ${Math.max(0.1, currentAlpha)})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      // Connect nearby particles (Entanglement pairs)
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const lineAlpha = (1 - dist / 120) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(220, 225, 240, ${lineAlpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // Mouse interactivity
      if (mouse.x !== null) {
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

    requestAnimationFrame(draw);
  }

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

  let theta = Math.PI / 4;
  let phi = Math.PI / 3;
  let animTime = 0;

  function updateValues() {
    if (valQubits) valQubits.textContent = qubitsSlider.value;
    if (valDepth) valDepth.textContent = depthSlider.value;
    if (valEntropy) valEntropy.textContent = parseFloat(entropySlider.value).toFixed(2);
    if (valHeads) valHeads.textContent = headsSlider.value;

    updateProbabilities(
      parseInt(qubitsSlider.value),
      parseFloat(entropySlider.value),
      parseInt(depthSlider.value)
    );
  }

  if (qubitsSlider) qubitsSlider.addEventListener('input', updateValues);
  if (depthSlider) depthSlider.addEventListener('input', updateValues);
  if (entropySlider) entropySlider.addEventListener('input', updateValues);
  if (headsSlider) headsSlider.addEventListener('input', updateValues);

  function renderBlochSphere() {
    const w = canvas.width = canvas.parentElement.clientWidth;
    const h = canvas.height = canvas.parentElement.clientHeight;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.35;

    ctx.clearRect(0, 0, w, h);

    animTime += 0.015;
    const currentTheta = theta + Math.sin(animTime) * 0.25 * parseFloat(entropySlider ? entropySlider.value : 0.5);
    const currentPhi = phi + animTime * 0.3;

    // Draw Sphere Outer Ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Equator Ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    ctx.beginPath();
    // Z axis (|0> to |1>)
    ctx.moveTo(cx, cy - r - 15);
    ctx.lineTo(cx, cy + r + 15);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('|0⟩', cx - 8, cy - r - 20);
    ctx.fillText('|1⟩', cx - 8, cy + r + 30);
    ctx.fillText('|i+⟩', cx + r + 15, cy + 4);

    // Vector Point Calculation
    const vx = r * Math.sin(currentTheta) * Math.cos(currentPhi);
    const vy = r * Math.cos(currentTheta);
    const vz = r * Math.sin(currentTheta) * Math.sin(currentPhi);

    // Projected 2D Point
    const px = cx + vx;
    const py = cy - vy + vz * 0.25;

    // Draw Vector Arrow
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ffffff';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Vector Endpoint Bead
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    requestAnimationFrame(renderBlochSphere);
  }

  renderBlochSphere();
}

/* Update Probability Amplitude Bars */
function updateProbabilities(qubits, entropy, depth) {
  // Generate pseudo-probabilities based on state sliders
  const states = ['|0000⟩', '|0001⟩', '|0110⟩', '|1111⟩'];
  const baseVal = 1 / 4;

  const p1 = Math.min(0.85, Math.max(0.05, 0.5 - entropy * 0.3 + (depth * 0.02)));
  const p2 = Math.min(0.7, Math.max(0.05, 0.25 + entropy * 0.2));
  const p3 = Math.min(0.5, Math.max(0.02, (1 - p1 - p2) * 0.6));
  const p4 = Math.max(0.01, 1 - p1 - p2 - p3);

  const values = [p1, p2, p3, p4];

  states.forEach((st, idx) => {
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
   3. Code Playground & Tab Switching
   ========================================================================== */
function initCodePlayground() {
  const codeSnippets = {
    python: `<span class="code-keyword">import</span> torch
<span class="code-keyword">from</span> laqumo <span class="code-keyword">import</span> LaQuMoForCausalLM, LaQuMoTokenizer

<span class="code-comment"># Initialize 100-Qubit Hybrid Large Quantum Model</span>
model = LaQuMoForCausalLM.from_pretrained(
    <span class="code-str">"laqumo-labs/LaQuMo-7B-Quantum-v1"</span>,
    qubits=<span class="code-func">100</span>,
    quantum_backend=<span class="code-str">"qiskit.aer_simulator"</span>,
    device_map=<span class="code-str">"auto"</span>
)
tokenizer = LaQuMoTokenizer.from_pretrained(<span class="code-str">"laqumo-labs/LaQuMo-7B"</span>)

<span class="code-comment"># Quantum Attention Inference</span>
prompt = <span class="code-str">"Compute ground state energy of Hamiltonian H = H_0 + \\lambda V"</span>
inputs = tokenizer(prompt, return_tensors=<span class="code-str">"pt"</span>).to(<span class="code-str">"cuda"</span>)
output = model.generate(**inputs, max_new_tokens=<span class="code-func">256</span>, temperature=<span class="code-func">0.2</span>)

print(tokenizer.decode(output[<span class="code-func">0</span>]))`,

    qiskit: `<span class="code-keyword">from</span> qiskit <span class="code-keyword">import</span> QuantumCircuit, Aer, execute
<span class="code-keyword">from</span> laqumo.qnn <span class="code-keyword">import</span> QuantumVariationalAttention

<span class="code-comment"># Construct 16-Qubit Variational Quantum Circuit Layer</span>
vqc_layer = QuantumVariationalAttention(n_qubits=<span class="code-func">16</span>, depth=<span class="code-func">12</span>)
circuit = vqc_layer.build_ansatz(entanglement=<span class="code-str">"full"</span>)

backend = Aer.get_backend(<span class="code-str">"qasm_simulator"</span>)
job = execute(circuit, backend, shots=<span class="code-func">8192</span>)
result = job.result()
counts = result.get_counts(circuit)

print(<span class="code-str">"State Amplitudes:"</span>, counts)`,

    curl: `<span class="code-comment"># Query LaQuMo REST API endpoint</span>
curl -X POST https://api.laqumo.org/v1/quantum/chat \\
  -H <span class="code-str">"Authorization: Bearer LQM_SECRET_KEY"</span> \\
  -H <span class="code-str">"Content-Type: application/json"</span> \\
  -d '{
    <span class="code-str">"model"</span>: <span class="code-str">"laqumo-7b-quantum"</span>,
    <span class="code-str">"messages"</span>: [{"role": "user", "content": "Solve VQE for Lithium Hydride (LiH)"}],
    <span class="code-str">"shots"</span>: 4096
  }'`
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

  // Copy code button
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
   4. Modals (Publications & Google Sites Embed Code Helper)
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
