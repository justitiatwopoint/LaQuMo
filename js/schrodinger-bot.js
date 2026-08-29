/* ==========================================================================
   PROF. ERWIN SCHRÖDINGER AI ASSISTANT (js/schrodinger-bot.js)
   Interactive Quantum Physics AI Assistant & Research Channel
   ========================================================================== */

class SchrodingerBot {
  constructor() {
    this.isOpen = false;
    this.whatsappNumber = "+905550000000";
    this.messages = [
      {
        sender: 'bot',
        text: "Guten Tag! I am **Prof. Erwin Schrödinger**. Welcome to the LaQuMo Virtual Lab. Ask me any question regarding wave mechanics, quantum state vectors, or simulation parameters."
      }
    ];
    this.init();
  }

  init() {
    this.renderWidget();
    this.initEvents();
  }

  renderWidget() {
    // 1. Floating Launcher
    const launcher = document.createElement('div');
    launcher.className = 'schrodinger-widget-launcher';
    launcher.id = 'schrodinger-launcher';
    launcher.innerHTML = `
      <div class="schrodinger-avatar-badge">
        Ψ
        <div class="schrodinger-status-dot"></div>
      </div>
      <div class="schrodinger-launcher-text">
        <div class="schrodinger-launcher-title">Prof. Schrödinger</div>
        <div class="schrodinger-launcher-sub">Quantum AI Assistant</div>
      </div>
    `;
    document.body.appendChild(launcher);

    // 2. Chat Popover Window
    const chatWindow = document.createElement('div');
    chatWindow.className = 'schrodinger-chat-window';
    chatWindow.id = 'schrodinger-chat-window';
    chatWindow.innerHTML = `
      <!-- Header -->
      <div class="schrodinger-chat-header">
        <div class="schrodinger-header-info">
          <div class="schrodinger-avatar-badge">Ψ</div>
          <div>
            <div style="font-family: var(--font-display); font-size: 0.92rem; font-weight: 700; color: #ffffff;">Prof. Erwin Schrödinger</div>
            <div style="font-size: 0.72rem; color: #cbd5e1; font-weight: 500;">Wave Mechanics &bull; Nobel Laureate</div>
          </div>
        </div>
        <button class="schrodinger-chat-close" id="schrodinger-close-btn">&times;</button>
      </div>

      <!-- Messages Body -->
      <div class="schrodinger-chat-body" id="schrodinger-messages">
        <!-- Rendered dynamically -->
      </div>

      <!-- Quick Chips -->
      <div class="chat-suggestions">
        <button class="chip-btn" data-query="cat">Cat Paradox</button>
        <button class="chip-btn" data-query="tunneling">Quantum Tunneling</button>
        <button class="chip-btn" data-query="bloch">Bloch Sphere</button>
        <button class="chip-btn" data-query="vqe">VQE Chemistry</button>
      </div>

      <!-- Input Bar -->
      <form class="schrodinger-chat-footer" id="schrodinger-form">
        <input type="text" id="schrodinger-input" class="chat-input" placeholder="Ask Prof. Schrödinger a physics question..." autocomplete="off">
        <button type="submit" class="chat-send-btn">Send</button>
      </form>
    `;
    document.body.appendChild(chatWindow);

    this.renderMessages();
  }

  initEvents() {
    const launcher = document.getElementById('schrodinger-launcher');
    const chatWindow = document.getElementById('schrodinger-chat-window');
    const closeBtn = document.getElementById('schrodinger-close-btn');
    const form = document.getElementById('schrodinger-form');
    const input = document.getElementById('schrodinger-input');

    launcher.onclick = () => this.toggle();
    closeBtn.onclick = () => this.close();

    form.onsubmit = (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      this.addUserMessage(text);
    };

    // Quick chips
    const chips = document.querySelectorAll('.chip-btn');
    chips.forEach(chip => {
      chip.onclick = (e) => {
        const query = e.currentTarget.getAttribute('data-query');
        if (query === 'cat') this.addUserMessage("Can you explain Schrödinger's Cat paradox?");
        if (query === 'tunneling') this.addUserMessage("How does Quantum Tunneling work in the simulator?");
        if (query === 'bloch') this.addUserMessage("Explain the 3D Bloch Sphere representation.");
        if (query === 'vqe') this.addUserMessage("What is the Variational Quantum Eigensolver (VQE)?");
      };
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const win = document.getElementById('schrodinger-chat-window');
    if (win) {
      if (this.isOpen) win.classList.add('open');
      else win.classList.remove('open');
    }
  }

  close() {
    this.isOpen = false;
    const win = document.getElementById('schrodinger-chat-window');
    if (win) win.classList.remove('open');
  }

  addUserMessage(text) {
    this.messages.push({ sender: 'user', text: text });
    this.renderMessages();

    // Generate intelligent AI response
    setTimeout(() => {
      const reply = this.generateQuantumAnswer(text);
      this.messages.push({ sender: 'bot', text: reply });
      this.renderMessages();
    }, 600);
  }

  generateQuantumAnswer(query) {
    const q = query.toLowerCase();

    if (q.includes('cat') || q.includes('paradox')) {
      return "Ah, my famous Gedankenexperiment (1935)! Until observation occurs, the radioactive atom is in a linear superposition state: $|\\Psi\\rangle = \\frac{1}{\\sqrt{2}}(|\\text{decayed}\\rangle + |\\text{intact}\\rangle)$. Macroscopically, the system remains in coherent superposition until decoherence occurs.";
    }

    if (q.includes('tunnel')) {
      return "In quantum mechanics, when a particle with energy $E$ encounters a potential barrier $V_0 > E$, its wavefunction does not vanish instantaneously. It exhibits exponential decay $\\psi(x) \\propto e^{-\\kappa x}$. If the barrier is finite, a non-zero probability amplitude $T = |t|^2$ emerges on the other side. Try the **Schrödinger Tunneling Simulator** in our Virtual Lab!";
    }

    if (q.includes('bloch') || q.includes('qubit')) {
      return "The Bloch Sphere represents a pure 2-level state: $|\\psi\\rangle = \\cos(\\theta/2)|0\\rangle + e^{i\\phi}\\sin(\\theta/2)|1\\rangle$. The north pole represents $|0\\rangle$, the south pole $|1\\rangle$, and the equator states represent equal superpositions.";
    }

    if (q.includes('vqe') || q.includes('variational') || q.includes('chemistry')) {
      return "The Variational Quantum Eigensolver (VQE) leverages the Rayleigh-Ritz variational principle: $\\langle \\Psi(\\theta) | H | \\Psi(\\theta) \\rangle \\ge E_0$. We prepare parameterized ansatz states on quantum hardware and optimize classical parameters $\\theta$ to approach ground state molecular energies.";
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('greetings')) {
      return "Greetings! How may I assist your quantum research today? Feel free to ask about wave mechanics, Rydberg blockade physics, or simulation algorithms.";
    }

    return `Fascinating inquiry regarding "${query}". According to the Time-Dependent Schrödinger Equation $i\\hbar\\frac{\\partial\\psi}{\\partial t} = \\hat{H}\\psi$, physical observables correspond to self-adjoint operators in Hilbert space. You can test wavepacket evolution directly in our **Schrödinger Tunneling** module!`;
  }

  renderMessages() {
    const container = document.getElementById('schrodinger-messages');
    if (!container) return;

    container.innerHTML = this.messages.map(m => `
      <div class="chat-bubble ${m.sender}">
        ${m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([container]).catch(() => {});
    }
  }
}

  openWhatsApp(customText = "") {
    const text = encodeURIComponent(customText || "Hello Dr. Schrödinger, I have a question regarding quantum simulations on LaQuMo!");
    const cleanPhone = this.whatsappNumber.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(waUrl, '_blank');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.schrodingerBot = new SchrodingerBot();
});
