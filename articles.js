/* ==========================================================================
   LAQUMO CLEAN & FUNCTIONAL ARTICLES ENGINE (js/articles.js)
   Renders real articles from DataStore with search, filters & modal reader
   ========================================================================== */

class ArticlesEngine {
  constructor() {
    this.container = document.getElementById('articles-feed');
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.init();
  }

  init() {
    this.renderArticles();
    this.initFilterEvents();
    this.initSearch();
  }

  getArticles() {
    return window.dataStore ? window.dataStore.getArticles() : [];
  }

  initFilterEvents() {
    const topicPills = document.querySelectorAll('.topic-pill');
    topicPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        topicPills.forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeCategory = e.currentTarget.getAttribute('data-topic');
        this.renderArticles();
      });
    });
  }

  initSearch() {
    const searchInput = document.getElementById('articles-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderArticles();
      });
    }
  }

  renderArticles() {
    if (!this.container) return;

    const allArticles = this.getArticles();

    const filtered = allArticles.filter(art => {
      const matchesCat = (this.activeCategory === 'all' || art.category === this.activeCategory);
      const matchesSearch = !this.searchQuery || 
        art.title.toLowerCase().includes(this.searchQuery) ||
        (art.abstract && art.abstract.toLowerCase().includes(this.searchQuery)) ||
        (art.tags && art.tags.some(t => t.toLowerCase().includes(this.searchQuery)));
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      this.container.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; background: #ffffff; border: 1px solid var(--silver-border); border-radius: var(--radius-md);">
          <h3 style="font-size: 1.2rem; margin-bottom: 6px;">Aradığınız kriterde makale bulunamadı</h3>
          <p style="color: var(--slate-medium); font-size: 0.88rem;">Farklı bir anahtar kelime deneyebilir veya tüm konuları seçebilirsiniz.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = filtered.map(art => `
      <article class="article-editorial-card" data-category="${art.category}">
        <div class="article-header-meta">
          <span class="badge">${art.category}</span>
          <div class="article-meta-right">
            <span>⏱️ ${art.read_time || '10 dk'}</span>
            <span>&bull;</span>
            <span>📅 ${art.date}</span>
          </div>
        </div>

        <h3 class="article-headline">
          <a href="#" onclick="event.preventDefault(); window.articlesEngine.openArticleModal('${art.id}')">
            ${art.title}
          </a>
        </h3>

        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <div class="author-avatar-img" style="width: 32px; height: 32px; font-size: 1.1rem;">👨‍🔬</div>
          <div>
            <div style="font-weight: 700; color: #0f172a; font-size: 0.88rem;">${art.author}</div>
            <div style="font-size: 0.76rem; color: var(--slate-light);">${art.institution || 'Institute for Advanced Quantum Physics'}</div>
          </div>
        </div>

        <p class="article-snippet">
          ${art.abstract || ''}
        </p>

        ${art.formula ? `
          <div class="math-block" style="background: #fffdf7; border: 1px solid rgba(180,83,9,0.15); padding: 10px; margin: 12px 0; border-radius: var(--radius-xs);">
            \\[ ${art.formula} \\]
          </div>
        ` : ''}

        <div class="article-reactions-bar">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="reaction-btn" onclick="window.articlesEngine.handleClap('${art.id}', this)">
              👏 <span class="clap-count">${art.claps || 0}</span>
            </button>
            <button class="reaction-btn" onclick="window.articlesEngine.handleBookmark(this)">
              🔖 Kaydet
            </button>
            <button class="reaction-btn" onclick="window.articlesEngine.handleShare('${art.title}')">
              📤 Paylaş
            </button>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.articlesEngine.openArticleModal('${art.id}')">
            Detaylı Oku &rarr;
          </button>
        </div>
      </article>
    `).join('');

    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([this.container]).catch(() => {});
    }
  }

  openArticleModal(artId) {
    const articles = this.getArticles();
    const art = articles.find(a => a.id === artId);
    if (!art) return;

    let modal = document.getElementById('article-reader-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'article-reader-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 820px; max-height: 88vh; overflow-y: auto; padding: 32px 28px; background: #ffffff;">
        <button class="modal-close-btn" onclick="window.articlesEngine.closeArticleModal()">&times;</button>
        
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px;">
          <span class="badge">${art.category}</span>
          <span style="font-size: 0.8rem; color: var(--slate-light);">⏱️ ${art.read_time || '10 dk'} &bull; 📅 ${art.date}</span>
        </div>

        <h1 style="font-size: 1.85rem; color: #0f172a; margin-bottom: 12px; line-height: 1.35;">${art.title}</h1>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--silver-border); padding-bottom: 14px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 40px; height: 40px; font-size: 1.4rem; background: var(--crimson-subtle); border: 1px solid var(--crimson-border); border-radius: 50%; display: flex; align-items: center; justify-content: center;">👨‍🔬</div>
            <div>
              <div style="font-weight: 700; color: #0f172a; font-size: 0.92rem;">${art.author}</div>
              <div style="font-size: 0.78rem; color: var(--slate-light);">${art.institution || 'Quantum Research Lab'}</div>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline btn-sm" onclick="window.articlesEngine.copyBibtex('${art.id}')">
              📜 BibTeX Alıntısı
            </button>
            ${art.sim_target ? `
              <a href="${art.sim_target}" class="btn btn-primary btn-sm">
                🧪 Simülasyonda Aç
              </a>
            ` : ''}
          </div>
        </div>

        <div style="font-size: 1rem; line-height: 1.8; color: #1e293b; margin-bottom: 24px;">
          <p style="font-weight: 600; color: #0f172a; font-size: 1.08rem; margin-bottom: 16px; border-left: 4px solid var(--crimson-bright); padding-left: 14px; background: #fffcf8; padding-top: 6px; padding-bottom: 6px;">
            ${art.abstract || ''}
          </p>

          ${art.formula ? `
            <div class="math-block" style="background: #fffdf5; border: 1px solid rgba(180,83,9,0.2); padding: 14px; margin: 20px 0; border-radius: var(--radius-sm); text-align: center;">
              \\[ ${art.formula} \\]
            </div>
          ` : ''}

          <p>${art.content || ''}</p>
        </div>
      </div>
    `;

    modal.classList.add('open');
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([modal]).catch(() => {});
    }
  }

  closeArticleModal() {
    const modal = document.getElementById('article-reader-modal');
    if (modal) modal.classList.remove('open');
  }

  handleClap(artId, btnEl) {
    const newCount = window.dataStore.addClap(artId);
    const countEl = btnEl.querySelector('.clap-count');
    if (countEl) countEl.textContent = newCount;
    if (window.showToast) window.showToast('👏 Makaleyi takdir ettiniz!');
  }

  handleBookmark(btnEl) {
    btnEl.innerHTML = '✅ Kaydedildi';
    btnEl.style.color = '#059669';
    if (window.showToast) window.showToast('Makale kaydedildi! 🔖');
  }

  handleShare(title) {
    if (navigator.share) {
      navigator.share({ title: title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        if (window.showToast) window.showToast('Makale bağlantısı panoya kopyalandı! 📤');
      });
    }
  }

  copyBibtex(artId) {
    const articles = this.getArticles();
    const art = articles.find(a => a.id === artId);
    if (!art) return;
    const bib = `@article{laqumo2026,\n  title={${art.title}},\n  author={${art.author}},\n  year={2026}\n}`;
    navigator.clipboard.writeText(bib).then(() => {
      if (window.showToast) window.showToast("BibTeX alıntısı panoya kopyalandı! 📜");
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.articlesEngine = new ArticlesEngine();
});
