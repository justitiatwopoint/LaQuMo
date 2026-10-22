/* ==========================================================================
   PROF. ERWIN SCHRÖDINGER AI ASSISTANT (js/schrodinger-bot.js)
   Chat widget shown on every page. Answers come from the free Cloudflare
   Workers AI function (cloudflare-worker/schrodinger-worker.js). If that is
   not set up yet, offline, or out of free allowance for the day, the bot
   falls back to its built-in answers so visitors always get a reply.
   ========================================================================== */

// Paste your Cloudflare Worker address here (see CHATBOT_SETUP.md), e.g.
// "https://laqumo-chat.yourname.workers.dev". Leave empty for built-in answers only.
const SCHRODINGER_API_URL = "https://laqumo-chat.snajib000.workers.dev";

class SchrodingerBot {
  constructor() {
    this.isOpen = false;
    this.busy = false;
    this.storageKey = "laqumo_chat_v1";
    this.greeting = {
      role: "assistant",
      content: "Guten Tag! I am **Prof. Schrödinger**, LaQuMo's AI guide. Ask me anything about quantum physics, the Virtual Lab simulators, or the history of physics."
    };
    this.messages = this.load() || [this.greeting];
    this.init();
  }

  /* ---------- Persistence (keeps the conversation while browsing pages) ---------- */
  load() {
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      const data = raw ? JSON.parse(raw) : null;
      return Array.isArray(data) && data.length ? data : null;
    } catch (e) { return null; }
  }
  save() {
    try { sessionStorage.setItem(this.storageKey, JSON.stringify(this.messages.slice(-30))); } catch (e) {}
  }

  /* ---------- Build the widget ---------- */
  init() {
    this.renderWidget();
    this.initEvents();
    this.renderMessages();
  }

  renderWidget() {
    const launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "schrodinger-widget-launcher";
    launcher.id = "schrodinger-launcher";
    launcher.setAttribute("aria-label", "Open chat with Prof. Schrödinger");
    launcher.innerHTML = `
      <span class="schrodinger-avatar-badge" aria-hidden="true">Ψ<span class="schrodinger-status-dot"></span></span>
      <span class="schrodinger-launcher-text">
        <span class="schrodinger-launcher-title">Prof. Schrödinger</span>
        <span class="schrodinger-launcher-sub">Ask a physics question</span>
      </span>`;
    document.body.appendChild(launcher);

    const win = document.createElement("div");
    win.className = "schrodinger-chat-window";
    win.id = "schrodinger-chat-window";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", "Chat with Prof. Schrödinger");
    win.innerHTML = `
      <div class="schrodinger-chat-header">
        <div class="schrodinger-header-info">
          <span class="schrodinger-avatar-badge" aria-hidden="true">Ψ</span>
          <div>
            <div class="schrodinger-header-title">Prof. Schrödinger</div>
            <div class="schrodinger-header-sub">LaQuMo AI guide &bull; quantum physics</div>
          </div>
        </div>
        <div class="schrodinger-header-actions">
          <button type="button" class="schrodinger-chat-reset" id="schrodinger-reset-btn" title="Start a new conversation">New chat</button>
          <button type="button" class="schrodinger-chat-close" id="schrodinger-close-btn" aria-label="Close chat">&times;</button>
        </div>
      </div>

      <div class="schrodinger-chat-body" id="schrodinger-messages" aria-live="polite"></div>

      <div class="chat-suggestions" id="schrodinger-chips">
        <button type="button" class="chip-btn" data-q="Can you explain Schrödinger's Cat paradox?">Cat paradox</button>
        <button type="button" class="chip-btn" data-q="How does quantum tunnelling work?">Tunnelling</button>
        <button type="button" class="chip-btn" data-q="What is the Bloch sphere?">Bloch sphere</button>
        <button type="button" class="chip-btn" data-q="What is the Variational Quantum Eigensolver (VQE)?">VQE</button>
      </div>

      <form class="schrodinger-chat-footer" id="schrodinger-form">
        <input type="text" id="schrodinger-input" class="chat-input" maxlength="800"
               placeholder="Ask a physics question…" autocomplete="off" aria-label="Your question">
        <button type="submit" class="chat-send-btn" id="schrodinger-send">Send</button>
      </form>
      <div class="schrodinger-disclaimer">AI answers can be wrong. Please double-check important facts.</div>`;
    document.body.appendChild(win);
  }

  initEvents() {
    const input = document.getElementById("schrodinger-input");
    document.getElementById("schrodinger-launcher").onclick = () => this.toggle();
    document.getElementById("schrodinger-close-btn").onclick = () => this.close();
    document.getElementById("schrodinger-reset-btn").onclick = () => {
      this.messages = [this.greeting];
      this.save();
      this.renderMessages();
      input.focus();
    };
    document.getElementById("schrodinger-form").onsubmit = (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || this.busy) return;
      input.value = "";
      this.ask(text);
    };
    document.querySelectorAll("#schrodinger-chips .chip-btn").forEach(chip => {
      chip.onclick = () => { if (!this.busy) this.ask(chip.dataset.q); };
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && this.isOpen) this.close(); });
  }

  toggle() { this.isOpen ? this.close() : this.open(); }
  open() {
    this.isOpen = true;
    document.getElementById("schrodinger-chat-window").classList.add("open");
    document.body.classList.add("schrodinger-chat-open");
    this.scrollToEnd();
    setTimeout(() => document.getElementById("schrodinger-input").focus(), 50);
  }
  close() {
    this.isOpen = false;
    document.getElementById("schrodinger-chat-window").classList.remove("open");
    document.body.classList.remove("schrodinger-chat-open");
  }

  /* ---------- Asking ---------- */
  async ask(text) {
    this.messages.push({ role: "user", content: text });
    this.save();
    this.setBusy(true);
    this.renderMessages();

    let reply = null, note = "";
    if (SCHRODINGER_API_URL) {
      try {
        const res = await this.fetchWithTimeout(SCHRODINGER_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: this.historyForApi() })
        }, 25000);
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.reply) {
          reply = data.reply;
        } else if (data.error === "rate_limited") {
          note = "You're asking quickly! Here's a built-in answer while I catch my breath.";
        } else if (data.error === "daily_limit") {
          note = "My AI has reached today's free limit, so here's a built-in answer. Full answers return tomorrow.";
        }
      } catch (e) { /* network problem: fall back below */ }
    }

    if (!reply) {
      reply = this.builtInAnswer(text);
      if (note) reply = `_${note}_\n\n${reply}`;
    }

    this.messages.push({ role: "assistant", content: reply });
    this.save();
    this.setBusy(false);
    this.renderMessages();
  }

  historyForApi() {
    // Skip the greeting; send the last few turns.
    return this.messages.slice(1).slice(-8).map(m => ({ role: m.role, content: m.content }));
  }

  fetchWithTimeout(url, opts, ms) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(t));
  }

  setBusy(b) {
    this.busy = b;
    const send = document.getElementById("schrodinger-send");
    if (send) send.disabled = b;
  }

  /* ---------- Built-in answers (used when the AI is unavailable) ---------- */
  builtInAnswer(query) {
    const q = query.toLowerCase();
    const has = (...w) => w.some(x => q.includes(x));

    if (has("cat", "paradox"))
      return "Ah, my famous Gedankenexperiment of 1935! A cat, a radioactive atom and a vial of poison share a sealed box. Until someone looks, quantum mechanics describes the atom as a superposition, $|\\Psi\\rangle = \\tfrac{1}{\\sqrt{2}}(|\\text{decayed}\\rangle + |\\text{intact}\\rangle)$, and so, absurdly, the cat too. I meant it to show how strange it is to apply quantum rules to everyday objects. Today we explain why we never see such cats through **decoherence**.";
    if (has("tunnel"))
      return "When a particle meets an energy barrier higher than its own energy, its wavefunction does not stop dead. It decays exponentially inside the barrier, $\\psi(x) \\propto e^{-\\kappa x}$, so if the barrier is thin some of it leaks through: the particle can appear on the other side. Try the **Schrödinger Tunneling** simulator in the Virtual Lab.";
    if (has("bloch", "qubit"))
      return "The Bloch sphere pictures a single qubit as a point on a sphere: $|\\psi\\rangle = \\cos(\\theta/2)|0\\rangle + e^{i\\phi}\\sin(\\theta/2)|1\\rangle$. The north pole is $|0\\rangle$, the south pole $|1\\rangle$, and points on the equator are equal superpositions. You can rotate one yourself in the **3D Bloch Sphere** simulator.";
    if (has("vqe", "variational", "eigensolver", "chemistry"))
      return "The Variational Quantum Eigensolver (VQE) estimates a molecule's lowest energy. A quantum circuit with adjustable angles $\\theta$ prepares a trial state, we measure its energy, and a classical optimiser tunes $\\theta$ to lower it. The variational principle, $\\langle \\Psi(\\theta)|H|\\Psi(\\theta)\\rangle \\ge E_0$, guarantees we approach the true ground energy from above. See **VQE Energy Estimation** in the Virtual Lab.";
    if (has("qaoa", "max-cut", "maxcut", "max cut"))
      return "QAOA, the Quantum Approximate Optimization Algorithm, alternates two kinds of quantum layers, controlled by angles $\\gamma$ and $\\beta$, to search for good solutions to problems like Max-Cut: splitting a graph's nodes into two groups so as many edges as possible cross between them. Try **Max-Cut QAOA Optimization** in the Virtual Lab.";
    if (has("rydberg", "neutral atom", "blockade"))
      return "In neutral-atom quantum computers, atoms held by laser 'tweezers' are excited to huge Rydberg states. Two nearby Rydberg atoms interact so strongly that only one can be excited at a time, the **Rydberg blockade**, which is how entangling gates are made. Explore it in the **Neutral-Atom Rydberg Lattice** simulator.";
    if (has("double slit", "double-slit", "interference", "slit"))
      return "Send particles one at a time through two slits and an interference pattern still builds up, as if each particle passed through both. Check which slit it used and the pattern disappears. It's the heart of quantum mechanics. Watch it form in the **Double-Slit Interference** simulator.";
    if (has("entangle"))
      return "Two particles are entangled when their joint state cannot be split into separate states for each, e.g. $\\tfrac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)$. Measuring one instantly tells you the other's result, however far apart they are, though this can't be used to send messages. Try building one in the **2-Qubit Quantum Circuit Grid**.";
    if (has("superposition"))
      return "A superposition is a combination of states, like $\\alpha|0\\rangle + \\beta|1\\rangle$. It isn't that the system is secretly in one of them; measurement gives $0$ with probability $|\\alpha|^2$ and $1$ with probability $|\\beta|^2$. See it on the **3D Bloch Sphere**.";
    if (has("nobel", "laureate", "prize"))
      return "Our blog has every Nobel Prize in Physics from 1901 to 2026, searchable by name, year or topic: see **Blog → Every Nobel Prize in Physics**.";
    if (has("contact", "email", "reach"))
      return "You can reach the LaQuMo team at **info@laqumo.com**, or use the contact form at the bottom of the home page.";
    if (/\b(hello|hi|hey|greetings|guten)\b/.test(q))
      return "Guten Tag! Ask me about superposition, entanglement, tunnelling, qubits, or any of the Virtual Lab simulators.";

    return "Wunderbar question! I can answer best on quantum topics such as superposition, entanglement, tunnelling, the Bloch sphere, VQE, QAOA, Rydberg atoms or the double-slit experiment. You can also explore the seven simulators in the **Virtual Lab**.";
  }

  /* ---------- Rendering ---------- */
  format(text) {
    // Escape HTML first so AI output can never inject markup.
    let s = String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s(])_(.+?)_(?=[\s.,;:!?)]|$)/g, "$1<em>$2</em>");
    s = s.replace(/^\s*[-*]\s+(.*)$/gm, "• $1");
    s = s.replace(/\n{2,}/g, "<br><br>").replace(/\n/g, "<br>");
    return s;
  }

  renderMessages() {
    const box = document.getElementById("schrodinger-messages");
    if (!box) return;
    box.innerHTML = this.messages.map(m =>
      `<div class="chat-bubble ${m.role === "user" ? "user" : "bot"}">${this.format(m.content)}</div>`
    ).join("") + (this.busy ? `<div class="chat-bubble bot typing" aria-label="Prof. Schrödinger is typing"><span></span><span></span><span></span></div>` : "");
    this.scrollToEnd();
    this.typesetMath(box);
  }

  scrollToEnd() {
    const box = document.getElementById("schrodinger-messages");
    if (box) box.scrollTop = box.scrollHeight;
  }

  typesetMath(el) {
    if (!/\$|\\\(/.test(el.textContent)) return;
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([el]).then(() => this.scrollToEnd()).catch(() => {});
      return;
    }
    // Pages without MathJax (e.g. the blog): load it once, on demand.
    if (!window.MathJax && !document.getElementById("MathJax-script")) {
      window.MathJax = {
        tex: { inlineMath: [["$", "$"], ["\\(", "\\)"]] },
        svg: { fontCache: "global" },
        startup: { ready: () => { MathJax.startup.defaultReady(); this.typesetMath(el); } }
      };
      const s = document.createElement("script");
      s.id = "MathJax-script";
      s.async = true;
      s.src = "https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js";
      document.head.appendChild(s);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.schrodingerBot = new SchrodingerBot();
});
