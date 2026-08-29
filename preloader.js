/* ==========================================================================
   LAQUMO QUANTUM PHYSICS PRELOADER ENGINE (js/preloader.js)
   Quantum Orbital Electron Wave & State Collapse Initialization
   ========================================================================== */

(function() {
  // Inject Preloader DOM if not present
  function createPreloader() {
    if (document.getElementById('quantum-preloader')) return;

    const preloader = document.createElement('div');
    preloader.id = 'quantum-preloader';
    preloader.className = 'quantum-preloader-overlay';
    preloader.innerHTML = `
      <div class="quantum-preloader-card">
        <!-- Physics Atom & Orbital Canvas -->
        <div class="preloader-atom-box">
          <div class="preloader-nucleus"></div>
          <div class="preloader-orbit orbit-a">
            <div class="preloader-electron electron-a"></div>
          </div>
          <div class="preloader-orbit orbit-b">
            <div class="preloader-electron electron-b"></div>
          </div>
          <div class="preloader-orbit orbit-c">
            <div class="preloader-electron electron-c"></div>
          </div>
        </div>

        <!-- Brand & Formula Ticker -->
        <div class="preloader-brand">
          <span class="preloader-title">LaQuMo</span>
          <span class="preloader-badge">v3.0 QUANTUM</span>
        </div>

        <div class="preloader-formula" id="preloader-formula-text">
          |\\Psi(t)\\rangle = \\exp(-i\\hat{\\mathcal{H}}t/\\hbar)|\\Psi(0)\\rangle
        </div>

        <!-- Progress Bar -->
        <div class="preloader-progress-track">
          <div class="preloader-progress-bar" id="preloader-bar"></div>
        </div>

        <div class="preloader-status">
          <span id="preloader-status-text">Initializing Quantum Registers...</span>
          <span id="preloader-pct">100%</span>
        </div>
      </div>
    `;

    document.body.appendChild(preloader);
  }

  // Hide Preloader smoothly
  function dismissPreloader() {
    const preloader = document.getElementById('quantum-preloader');
    if (!preloader) return;

    const bar = document.getElementById('preloader-bar');
    const pct = document.getElementById('preloader-pct');
    const status = document.getElementById('preloader-status-text');

    if (bar) bar.style.width = '100%';
    if (pct) pct.textContent = '100%';
    if (status) status.textContent = 'Quantum State Normalized ✓';

    setTimeout(() => {
      preloader.classList.add('preloader-hidden');
      setTimeout(() => {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }, 500);
    }, 450);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createPreloader();
      // Simulate rapid progress loading
      const bar = document.getElementById('preloader-bar');
      const pct = document.getElementById('preloader-pct');
      if (bar && pct) {
        let p = 15;
        const interval = setInterval(() => {
          p += Math.floor(Math.random() * 25) + 15;
          if (p >= 100) {
            p = 100;
            clearInterval(interval);
          }
          bar.style.width = `${p}%`;
          pct.textContent = `${p}%`;
        }, 60);
      }
    });
    window.addEventListener('load', dismissPreloader);
  } else {
    createPreloader();
    setTimeout(dismissPreloader, 350);
  }

  // Safety fallback dismiss after 1.5s max
  setTimeout(dismissPreloader, 1500);
})();
