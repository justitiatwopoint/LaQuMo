/* ==========================================================================
   LAQUMO QUANTUM ARTICLE & LATEX LIVE EDITOR ENGINE (js/editor.js)
   ========================================================================== */

class QuantumEditor {
  constructor() {
    this.textarea = document.getElementById('editor-content');
    this.preview = document.getElementById('editor-preview');
    this.titleInput = document.getElementById('editor-title');
    this.categorySelect = document.getElementById('editor-category');
    this.tagsInput = document.getElementById('editor-tags');
    this.storageDraftKey = 'laqumo_editor_draft';
    this.storagePublishedKey = 'laqumo_published_articles';

    this.init();
  }

  init() {
    if (!this.textarea || !this.preview) return;

    if (!this.checkPermission()) return;

    this.loadDraft();
    this.initEvents();
    this.updatePreview();
  }

  checkPermission() {
    const user = (window.auth && window.auth.getCurrentUser) ? window.auth.getCurrentUser() : null;
    
    // If not logged in or unverified, show authorization banner
    if (!user || user.status === 'pending') {
      const editorWorkspace = document.querySelector('.editor-workspace');
      if (editorWorkspace) {
        editorWorkspace.innerHTML = `
          <div style="max-width: 600px; margin: 80px auto; text-align: center; background: #ffffff; border: 1px solid var(--silver-border); border-radius: var(--radius-xl); padding: 45px 36px; box-shadow: var(--glass-shadow);">
            <div style="font-size: 3.5rem; margin-bottom: 16px;">🔒</div>
            <div class="badge" style="margin-bottom: 12px; background: rgba(225,29,72,0.1); color: var(--crimson-bright); border-color: var(--crimson-border);">
              YETKİLİ YAZAR ERİŞİMİ
            </div>
            <h2 style="font-size: 1.8rem; margin-bottom: 12px;">Akademik Makale Yazma İzni Gerekli</h2>
            <p style="color: var(--slate-medium); font-size: 0.95rem; line-height: 1.65; margin-bottom: 24px;">
              LaQuMo bilimsel yayın kalitesini korumak amacıyla LaTeX makale editörü yalnızca hakem onayından geçmiş onaylı araştırmacılara ve doktora öğrencilerine açıktır.
            </p>
            <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
              <a href="dashboard.html" class="btn btn-primary">
                👤 Araştırmacı Portalı & İzin Talebi
              </a>
              <a href="articles.html" class="btn btn-outline">
                📖 Makaleleri Oku
              </a>
            </div>
          </div>
        `;
      }
      return false;
    }
    return true;
  }

  initEvents() {
    // Live update on typing
    this.textarea.addEventListener('input', () => {
      this.updatePreview();
      this.saveDraft();
      this.updateWordCount();
    });

    if (this.titleInput) {
      this.titleInput.addEventListener('input', () => {
        this.updatePreview();
        this.saveDraft();
      });
    }

    // Math symbol toolbar buttons
    const mathBtns = document.querySelectorAll('[data-insert]');
    mathBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = e.currentTarget.getAttribute('data-insert');
        this.insertTextAtCursor(text);
      });
    });

    // Publish button
    const publishBtn = document.getElementById('btn-publish-article');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => this.publishArticle());
    }

    // Export button
    const exportBtn = document.getElementById('btn-export-md');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportMarkdown());
    }
  }

  insertTextAtCursor(insertText) {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const value = this.textarea.value;

    this.textarea.value = value.substring(0, start) + insertText + value.substring(end);
    this.textarea.focus();
    this.textarea.selectionStart = this.textarea.selectionEnd = start + insertText.length;

    this.updatePreview();
    this.saveDraft();
    this.updateWordCount();
  }

  updateWordCount() {
    const text = this.textarea.value.trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    const countTag = document.getElementById('editor-word-count');
    if (countTag) countTag.textContent = `${wordCount} words`;
  }

  updatePreview() {
    const title = (this.titleInput ? this.titleInput.value.trim() : '') || 'Untitled Quantum Manuscript';
    const category = this.categorySelect ? this.categorySelect.value : 'Quantum Computing';
    const tags = this.tagsInput ? this.tagsInput.value.split(',').map(t => t.trim()).filter(Boolean) : ['Theory'];
    const rawContent = this.textarea.value;

    // Simple, clean Markdown parsing for headings, bold, italic, lists, and code
    let formattedHtml = rawContent
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/gim, '<div class="code-window"><div class="code-body"><pre><code>$1</code></pre></div></div>')
      .replace(/`([^`]+)`/gim, '<code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono);">$1</code>')
      .replace(/\n\n/gim, '<p style="margin-bottom: 14px;"></p>');

    this.preview.innerHTML = `
      <div style="margin-bottom: 20px;">
        <span class="badge" style="margin-bottom: 8px;">${category}</span>
        <h1 style="font-size: 2.1rem; color: #0f172a; margin-bottom: 6px;">${title}</h1>
        <div style="font-size: 0.85rem; color: var(--text-muted);">
          Author: <strong>${(window.auth && window.auth.currentUser) ? window.auth.currentUser.name : 'Dr. Researcher'}</strong> &bull; Draft Preview &bull; ${new Date().toLocaleDateString()}
        </div>
      </div>
      <div style="border-top: 1px solid var(--silver-border); padding-top: 20px; line-height: 1.8; color: var(--text-secondary);">
        ${formattedHtml}
      </div>
      <div style="margin-top: 30px; display: flex; gap: 6px; flex-wrap: wrap;">
        ${tags.map(t => `<span class="badge" style="font-size: 0.72rem; padding: 2px 8px;">#${t}</span>`).join('')}
      </div>
    `;

    // Render LaTeX equations in MathJax
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }

  saveDraft() {
    const draft = {
      title: this.titleInput ? this.titleInput.value : '',
      category: this.categorySelect ? this.categorySelect.value : '',
      tags: this.tagsInput ? this.tagsInput.value : '',
      content: this.textarea.value,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(this.storageDraftKey, JSON.stringify(draft));
  }

  loadDraft() {
    try {
      const saved = localStorage.getItem(this.storageDraftKey);
      if (saved) {
        const draft = JSON.parse(saved);
        if (this.titleInput) this.titleInput.value = draft.title || '';
        if (this.categorySelect) this.categorySelect.value = draft.category || 'Quantum Computing';
        if (this.tagsInput) this.tagsInput.value = draft.tags || 'VQE, Hamiltonian';
        if (this.textarea) this.textarea.value = draft.content || '';
        this.updateWordCount();
      }
    } catch (e) {}
  }

  publishArticle() {
    const title = this.titleInput ? this.titleInput.value.trim() : '';
    const content = this.textarea.value.trim();

    if (!title || !content) {
      alert('Lütfen başlık ve makale içeriğini doldurunuz.');
      return;
    }

    const user = (window.auth && window.auth.getCurrentUser) ? window.auth.getCurrentUser() : null;

    const newArticle = {
      id: 'art-' + Date.now(),
      title: title,
      author: user ? user.name : 'Dr. Richard Feynman',
      institution: user ? user.institution : 'Institute for Advanced Quantum Physics',
      date: new Date().toISOString().split('T')[0],
      read_time: `${Math.max(2, Math.round(content.split(/\s+/).length / 140))} dk okuma`,
      category: this.categorySelect ? this.categorySelect.value : 'Quantum Chemistry',
      tags: this.tagsInput ? this.tagsInput.value.split(',').map(t => t.trim()).filter(Boolean) : ['Theory', 'Quantum'],
      abstract: content.substring(0, 180) + '...',
      formula: '\\hat{\\mathcal{H}}|\\Psi\\rangle = E|\\Psi\\rangle',
      content: content,
      claps: 1
    };

    if (window.dataStore) {
      window.dataStore.saveArticle(newArticle);
    }

    if (window.showToast) {
      window.showToast('Makale başarıyla yayınlandı! 🚀');
    }

    setTimeout(() => {
      window.location.href = 'articles.html';
    }, 800);
  }

  exportMarkdown() {
    const title = this.titleInput ? this.titleInput.value : 'article';
    const content = `# ${title}\n\n${this.textarea.value}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.showToast) window.showToast('Markdown file downloaded!');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.quantumEditor = new QuantumEditor();
});
