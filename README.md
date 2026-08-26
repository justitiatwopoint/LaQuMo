# LaQuMo: Large Quantum Model v3.0

[![Version](https://img.shields.io/badge/version-3.0.0--PRO-00f2fe?style=for-the-badge&logo=quantum)](https://github.com/)
[![License](https://img.shields.io/badge/license-MIT-gray?style=for-the-badge)](LICENSE)
[![Theme](https://img.shields.io/badge/theme-Obsidian_Quantum_Neon-030305?style=for-the-badge)](styles.css)
[![GitHub Pages](https://img.shields.io/badge/Hosted_on-GitHub_Pages-black?style=for-the-badge&logo=github)](GITHUB_PAGES_DOMAIN_GUIDE.md)

**LaQuMo (Large Quantum Model) v3.0** is a state-of-the-art hybrid quantum-classical artificial intelligence architecture designed for quantum chemistry simulation, combinatorial optimization, and cryptographic reasoning.

This repository contains the interactive scientific web application showcase for LaQuMo featuring a **quantum neon obsidian theme** with glassmorphism, mathematical LaTeX notation, live quantum state vector simulation, and a live AI prompt execution engine.

---

##  Key Features

- **Live Quantum AI Prompt Simulator**: Real-time terminal interface streaming VQC ansatz execution, NISQ noise mitigation, state collapse, and tensor outputs.
- **Interactive Quantum State Visualizer**: Live 3D Bloch sphere vector projection canvas, 128-Qubit state sliders, T2 decoherence noise controls, and real-time probability amplitude distribution charts ($|0000\rangle \dots |1111\rangle$).
- **Quantum Neon Canvas**: Particle entanglement background physics simulation rendered on HTML5 canvas with mouse interaction physics.
- **LaTeX Mathematical Equations**: Native MathJax v3 integration rendering continuous quantum operator equations and Variational Quantum Circuit (VQC) ansatzes.
- **Scientific Benchmarks**: Quantitative evaluations comparing LaQuMo-3.0 against classical models (GPT-4, Claude 3.5 Sonnet, Gemini 1.5 Pro) across VQE energy estimation, FeMoco active site simulation, and Max-Cut optimization.
- **Developer SDK Playground**: Interactive code viewer supporting PyTorch, Qiskit, PennyLane, and cURL REST API with copy functionality.
- **GitHub Pages + Custom Domain**: Fully optimized for GitHub Pages hosting with custom 3rd-party domain mapping.

---

##  Repository Structure

```text
├── index.html                  # Main interactive scientific single-page web app
├── styles.css                  # Quantum neon dark glassmorphic stylesheet
├── app.js                      # Particle physics canvas, Bloch sphere simulation, and AI terminal logic
├── server.js                   # Lightweight Node.js local development server
├── GITHUB_PAGES_DOMAIN_GUIDE.md # GitHub Pages & Custom Domain setup guide
└── README.md                   # Project documentation
```

---

##  Quick Start (Local Development)

### Prerequisites
- Node.js (v18+) or any standard static web server.

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/laqumo.git
   cd laqumo
   ```

2. **Start the local server**:
   ```bash
   node server.js
   ```

3. **Open in browser**:
   Navigate to [`http://localhost:8080`](http://localhost:8080) to interact with the application.

---

##  Hosting on GitHub Pages with Custom Domain

To publish this website using **GitHub Pages** with your custom third-party domain:

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Deploy LaQuMo v3.0 site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/laqumo.git
   git push -u origin main
   ```
2. Enable GitHub Pages in **Settings > Pages** (`main` branch).
3. Set your custom domain DNS records (4 Apex `A` Records pointing to GitHub's IPs `185.199.108.153` ... `185.199.111.153` and 1 `CNAME` for `www`).
4. Read the step-by-step instructions in [`GITHUB_PAGES_DOMAIN_GUIDE.md`](GITHUB_PAGES_DOMAIN_GUIDE.md).

---

##  Mathematical Formulation

LaQuMo represents multi-qubit system state vectors in Hilbert space:

$$\hat{\mathcal{H}}_{LaQuMo} |\Psi(\theta)\rangle = \sum_{k=1}^{N} \alpha_k \left( \bigotimes_{i=1}^{q} U_i(\theta_i) \right) |0\rangle^{\otimes q} = E_0 |\Psi\rangle$$

Quantum Multi-Head Self-Attention (Q-MHA) calculates key-query inner products directly on quantum registers:

$$\text{Attention}(Q,K,V) = \text{Softmax}\left( \frac{|\langle \psi_Q | \psi_K \rangle|^2}{\sqrt{d_k}} \right) V$$

---

##  License

This project is licensed under the [MIT License](LICENSE).
