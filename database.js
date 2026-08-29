/* ==========================================================================
   QUANTUM SYSTEMS & MATERIALS EXPLORER (Materials Project & NuDat style)
   ========================================================================== */

class QuantumDatabase {
  constructor() {
    this.systems = [];
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.container = document.getElementById('systems-container');
    this.modalBackdrop = document.getElementById('system-modal');

    this.init();
  }

  async init() {
    try {
      const res = await fetch('data/quantum_systems.json');
      this.systems = await res.json();
      this.render();
      this.initEvents();
    } catch (err) {
      console.error('Failed to load quantum systems database:', err);
    }
  }

  initEvents() {
    // Category filter pills
    const pills = document.querySelectorAll('[data-category]');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        pills.forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeCategory = e.currentTarget.getAttribute('data-category');
        this.render();
      });
    });

    // Search bar
    const searchInput = document.getElementById('database-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Modal close
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.modalBackdrop) this.closeModal();
      });
    }
  }

  filterSystems() {
    return this.systems.filter(item => {
      const matchCat = this.activeCategory === 'all' || item.category.toLowerCase().includes(this.activeCategory.toLowerCase());
      const matchSearch = !this.searchQuery || 
        item.name.toLowerCase().includes(this.searchQuery) ||
        item.description.toLowerCase().includes(this.searchQuery) ||
        item.tags.some(t => t.toLowerCase().includes(this.searchQuery));
      return matchCat && matchSearch;
    });
  }

  render() {
    if (!this.container) return;
    const filtered = this.filterSystems();

    if (filtered.length === 0) {
      this.container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">🔬</div>
          <h3>No quantum systems match your filter</h3>
          <p style="margin-top: 8px;">Try clearing your search query or selecting "All Categories".</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = filtered.map(item => `
      <div class="system-card" onclick="window.quantumDB.openModal('${item.id}')">
        <div class="system-tag">${item.category} &bull; ${item.qubits_required} Qubits</div>
        <div class="system-name">${item.name}</div>
        <p style="font-size: 0.86rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
          ${item.description}
        </p>
        
        <table class="system-props-table">
          <tr>
            <td>Ground State \(E_0\):</td>
            <td style="color: var(--accent-cyan);">${item.ground_state_energy}</td>
          </tr>
          <tr>
            <td>Type:</td>
            <td>${item.type}</td>
          </tr>
        </table>

        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: auto; padding-top: 12px;">
          ${item.tags.map(t => `<span class="badge" style="font-size: 0.7rem; padding: 2px 8px;">#${t}</span>`).join('')}
        </div>
      </div>
    `).join('');

    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }

  openModal(id) {
    const item = this.systems.find(s => s.id === id);
    if (!item || !this.modalBackdrop) return;

    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;

    // Build energy spectrum ladder items (NuDat style)
    const ladderItems = item.energy_levels.map((lvl, idx) => `
      <div class="ladder-rung ${idx === 0 ? 'ground-state' : ''}">
        <span style="width: 40px;">E_${idx}</span>
        <div class="ladder-line"></div>
        <span style="width: 90px; text-align: right;">${lvl.toFixed(4)}</span>
      </div>
    `).join('');

    // Build properties table
    const propsList = Object.entries(item.properties).map(([k, v]) => `
      <tr>
        <td style="font-weight: 600; color: var(--text-secondary); width: 45%;">${k}</td>
        <td style="font-family: var(--font-mono);">${v}</td>
      </tr>
    `).join('');

    modalBody.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <span class="badge">${item.category}</span>
        <span class="badge" style="border-color: var(--accent-purple); color: var(--accent-purple);">
          ${item.qubits_required} Qubits Required
        </span>
      </div>
      <h2 style="font-size: 1.8rem; margin-bottom: 12px;">${item.name}</h2>
      <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
        ${item.description}
      </p>

      <div style="margin-bottom: 24px;">
        <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-cyan); margin-bottom: 8px;">
          Hamiltonian Operator
        </h4>
        <div class="math-block">
          \\[ ${item.hamiltonian} \\]
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        <div>
          <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-cyan); margin-bottom: 8px;">
            Energy Eigenvalue Spectrum
          </h4>
          <div class="spectrum-box">
            <div class="energy-ladder">
              ${ladderItems}
            </div>
          </div>
        </div>

        <div>
          <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent-cyan); margin-bottom: 8px;">
            Physical Parameters
          </h4>
          <table class="system-props-table" style="font-size: 0.88rem;">
            ${propsList}
          </table>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
        <button class="btn btn-outline btn-sm" onclick="window.quantumDB.copyParams('${item.id}')">
          📋 Copy System Config
        </button>
        <a href="lab.html" class="btn btn-primary btn-sm">
          🚀 Simulate in Virtual Lab
        </a>
      </div>
    `;

    this.modalBackdrop.classList.add('open');

    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }

  closeModal() {
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.remove('open');
    }
  }

  copyParams(id) {
    const item = this.systems.find(s => s.id === id);
    if (!item) return;
    navigator.clipboard.writeText(JSON.stringify(item, null, 2));
    if (window.showToast) window.showToast('System configuration copied to clipboard!');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.quantumDB = new QuantumDatabase();
});
