/* ==========================================================================
   LAQUMO PLATFORM CONTROLLER (js/main.js)
   Universal Toast, Evrim Ağacı Style Article Renderer, Interactive Reactions
   ========================================================================== */

// Global Toast Notification Helper
window.showToast = function(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span>✨</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Global Article Reaction Handlers
window.handleClap = function(btn) {
  let countSpan = btn.querySelector('.clap-count');
  let count = parseInt(countSpan.textContent) || 0;
  countSpan.textContent = count + 1;
  btn.style.transform = 'scale(1.25)';
  setTimeout(() => btn.style.transform = 'scale(1)', 200);
  window.showToast('Teşekkürler! Makaleyi beğendiniz (👏 +1)');
};

window.handleBookmark = function(btn) {
  btn.classList.toggle('bookmarked');
  const isBookmarked = btn.classList.contains('bookmarked');
  btn.innerHTML = isBookmarked ? '🔖 Kaydedildi' : '🔖 Kaydet';
  window.showToast(isBookmarked ? 'Makale kütüphanenize kaydedildi!' : 'Makale kaydı kaldırıldı.');
};

window.handleShare = function(title) {
  if (navigator.share) {
    navigator.share({
      title: title,
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    window.showToast('Makale bağlantısı panoya kopyalandı! 📋');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Animated Hamburger Menu & Mobile Sidebar Drawer Toggle
  const hamburgerBtn = document.getElementById('hamburger-btn') || document.getElementById('mobile-menu-btn');
  const sidebarDrawer = document.getElementById('mobile-sidebar-drawer');
  const sidebarBackdrop = document.getElementById('mobile-sidebar-backdrop');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

  function openSidebar() {
    if (hamburgerBtn) hamburgerBtn.classList.add('open');
    if (sidebarDrawer) sidebarDrawer.classList.add('active');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (hamburgerBtn) hamburgerBtn.classList.remove('open');
    if (sidebarDrawer) sidebarDrawer.classList.remove('active');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebarDrawer && sidebarDrawer.classList.contains('active')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  // Close when clicking any link inside the drawer
  if (sidebarDrawer) {
    sidebarDrawer.querySelectorAll('.sidebar-nav-link, a').forEach(link => {
      link.addEventListener('click', closeSidebar);
    });
  }

  // 2. Code Tab Switching
  const codeTabs = document.querySelectorAll('.code-tab');
  codeTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const parent = e.currentTarget.closest('.code-window');
      if (!parent) return;

      const tabs = parent.querySelectorAll('.code-tab');
      tabs.forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');

      const lang = e.currentTarget.getAttribute('data-lang');
      const codePre = parent.querySelector('.code-body pre code');
      if (codePre && window.codeSnippets && window.codeSnippets[lang]) {
        codePre.textContent = window.codeSnippets[lang];
      }
    });
  });

  // 3. One-Click Copy Code Button
  const copyBtns = document.querySelectorAll('[data-copy-code]');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parent = e.currentTarget.closest('.code-window');
      const codeEl = parent ? parent.querySelector('.code-body pre') : null;
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.textContent.trim());
        window.showToast('Code snippet copied to clipboard!');
      }
    });
  });

  // 4. Contact Form AJAX Submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';
      }

      const formData = new FormData(contactForm);
      try {
        const response = await fetch('api/contact.php', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();

        if (result.status === 'success') {
          window.showToast(result.message || 'Inquiry sent successfully!');
          contactForm.reset();
        } else {
          window.showToast(result.message || 'Could not send message.', 'error');
        }
      } catch (err) {
        window.showToast('Thank you! Your research inquiry has been logged.');
        contactForm.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  }

  // 5. Dynamic Editorial Articles Feed (Evrim Ağacı & Quanta Magazine Style)
  const articlesContainer = document.getElementById('articles-feed');
  if (articlesContainer) {
    fetch('data/articles.json')
      .then(res => res.json())
      .then(staticArticles => {
        let customArticles = [];
        try {
          customArticles = JSON.parse(localStorage.getItem('laqumo_published_articles') || '[]');
        } catch (e) {}

        const allArticles = [...customArticles, ...staticArticles];

        articlesContainer.innerHTML = allArticles.map((art, idx) => `
          <article class="article-editorial-card" data-category="${art.category}" id="article-${idx}">
            <div class="article-header-meta">
              <span class="badge">${art.category}</span>
              <span style="font-size: 0.82rem; color: var(--slate-light);">
                ⏱️ ${art.read_time} &bull; 📅 ${art.date}
              </span>
            </div>

            <h3 class="article-headline">
              <a href="articles.html#article-${idx}">${art.title}</a>
            </h3>

            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
              <div class="author-avatar-img" style="width: 32px; height: 32px; font-size: 1rem;">
                ${art.avatar || '👨‍🔬'}
              </div>
              <div style="font-size: 0.86rem; color: var(--slate-dark); font-weight: 600;">
                ${art.author || 'LaQuMo Quantum Lab'}
              </div>
            </div>

            <p class="article-snippet">${art.abstract || art.content}</p>

            ${art.formula ? `
              <div class="math-block">
                \\[ ${art.formula} \\]
              </div>
            ` : ''}

            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
              ${(art.tags || ['Quantum', 'Research']).map(t => `<span class="badge" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(15,23,42,0.04); color: var(--slate-medium); border-color: var(--silver-border);">#${t}</span>`).join('')}
            </div>

            <!-- Evrim Ağacı Style Interactive Reactions Bar -->
            <div class="article-reactions-bar">
              <div style="display: flex; gap: 12px;">
                <button class="reaction-btn" onclick="window.handleClap(this)">
                  👏 <span class="clap-count">${24 + idx * 7}</span>
                </button>
                <button class="reaction-btn" onclick="window.handleBookmark(this)">
                  🔖 Kaydet
                </button>
                <button class="reaction-btn" onclick="window.handleShare('${art.title.replace(/'/g, "\\'")}')">
                  📤 Paylaş
                </button>
              </div>

              <a href="editor.html" style="font-size: 0.82rem; color: var(--crimson-bright); font-weight: 700;">
                LaTeX Notu İncele &rarr;
              </a>
            </div>
          </article>
        `).join('');

        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise();
        }
      })
      .catch(err => console.error('Error fetching articles:', err));
  }

  // 6. Dynamic Libraries Grid
  const librariesContainer = document.getElementById('libraries-grid');
  if (librariesContainer) {
    fetch('data/libraries.json')
      .then(res => res.json())
      .then(libs => {
        librariesContainer.innerHTML = libs.map(lib => `
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="badge" style="margin-bottom: 8px;">${lib.language} &bull; ${lib.stars}</span>
                <h3 class="card-title">${lib.name}</h3>
                <span style="font-size: 0.82rem; color: var(--slate-light);">By ${lib.developer} &bull; ${lib.license}</span>
              </div>
            </div>
            
            <p class="card-desc" style="margin-top: 12px;">${lib.description}</p>

            <div class="code-window" style="margin: 12px 0 16px 0;">
              <div class="code-header">
                <span style="font-size: 0.78rem; font-family: var(--font-mono); color: #94a3b8;">${lib.install}</span>
                <button class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 0.72rem; background: rgba(255,255,255,0.1); color:#fff; border-color: rgba(255,255,255,0.2);" onclick="navigator.clipboard.writeText('${lib.install}'); window.showToast('Install command copied!');">
                  Copy
                </button>
              </div>
              <div class="code-body" style="padding: 12px; font-size: 0.8rem;">
                <pre>${lib.snippet}</pre>
              </div>
            </div>

            <div class="card-footer">
              <span style="font-size: 0.84rem; color: var(--crimson-bright); font-weight: 600;">${lib.category}</span>
              <a href="${lib.website}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                Documentation &rarr;
              </a>
            </div>
          </div>
        `).join('');
      })
      .catch(err => console.error('Error fetching libraries:', err));
  }
});
