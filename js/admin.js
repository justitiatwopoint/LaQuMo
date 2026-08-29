/* ==========================================================================
   LAQUMO CLEAN & FUNCTIONAL ADMIN CONTROLLER (js/admin.js)
   Real User & Publication Management with DataStore
   ========================================================================== */

class AdminConsole {
  constructor() {
    this.usersTbody = document.getElementById('admin-users-tbody');
    this.articlesTbody = document.getElementById('admin-articles-tbody');
    this.init();
  }

  init() {
    this.initTabs();
    this.renderUsers();
    this.renderArticles();
    this.updateKPIs();
  }

  initTabs() {
    const tabBtns = document.querySelectorAll('[data-admin-tab]');
    const sections = document.querySelectorAll('.admin-section');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => b.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        const targetId = e.currentTarget.getAttribute('data-admin-tab');
        e.currentTarget.classList.add('active');

        const targetSec = document.getElementById(targetId);
        if (targetSec) targetSec.classList.add('active');
      });
    });
  }

  updateKPIs() {
    const users = window.dataStore ? window.dataStore.getUsers() : [];
    const articles = window.dataStore ? window.dataStore.getArticles() : [];

    const kpiUsers = document.getElementById('kpi-total-users');
    const kpiArticles = document.getElementById('kpi-total-articles');

    if (kpiUsers) kpiUsers.textContent = users.length;
    if (kpiArticles) kpiArticles.textContent = articles.length;
  }

  renderUsers() {
    if (!this.usersTbody) return;

    const users = window.dataStore ? window.dataStore.getUsers() : [];

    this.usersTbody.innerHTML = users.map(user => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 1.4rem;">${user.avatar || '👨‍🔬'}</div>
            <div>
              <div style="font-weight: 700; color: #0f172a;">${user.name}</div>
              <div style="font-size: 0.76rem; color: var(--slate-light);">${user.email}</div>
            </div>
          </div>
        </td>
        <td style="font-size: 0.85rem;">${user.institution}</td>
        <td>
          <span class="badge" style="font-size: 0.72rem;">${user.role}</span>
          <div style="margin-top: 3px;">
            ${user.can_publish !== false 
              ? '<span style="font-size: 0.7rem; color: #059669; font-weight: 700;">✍️ Yazar İzni Aktif</span>' 
              : '<span style="font-size: 0.7rem; color: var(--slate-light);">🔒 Yazar İzni Yok</span>'}
          </div>
        </td>
        <td>
          ${user.status === 'verified'
            ? '<span class="badge" style="background: rgba(5, 150, 105, 0.1); color: #059669;">✅ Onaylandı</span>'
            : '<span class="badge" style="background: rgba(217, 119, 6, 0.1); color: #d97706;">⏳ Bekliyor</span>'}
        </td>
        <td style="font-size: 0.82rem; color: var(--slate-light);">${user.joinedDate || '2026-01-10'}</td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 4px;">
            ${user.status !== 'verified' ? `
              <button class="btn btn-primary btn-sm" style="padding: 3px 8px; font-size: 0.76rem;" onclick="window.adminConsole.verifyUser('${user.id}')">
                Onayla
              </button>
            ` : ''}
            <button class="btn btn-outline btn-sm" style="padding: 3px 8px; font-size: 0.76rem;" onclick="window.adminConsole.togglePerm('${user.id}')">
              ✍️ İzin
            </button>
            <button class="btn btn-outline btn-sm" style="padding: 3px 8px; font-size: 0.76rem; color: var(--crimson-bright);" onclick="window.adminConsole.deleteUser('${user.id}')">
              Sil
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  verifyUser(userId) {
    const users = window.dataStore.getUsers();
    const u = users.find(x => x.id === userId);
    if (u) {
      u.status = 'verified';
      window.dataStore.saveUsers(users);
      this.renderUsers();
      this.updateKPIs();
      if (window.showToast) window.showToast('Kullanıcı onaylandı! ✅');
    }
  }

  togglePerm(userId) {
    const newPerm = window.dataStore.toggleUserPerm(userId);
    this.renderUsers();
    if (window.showToast) window.showToast(`Yazarlık izni: ${newPerm ? 'Aktif' : 'Devre Dışı'}`);
  }

  deleteUser(userId) {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      window.dataStore.deleteUser(userId);
      this.renderUsers();
      this.updateKPIs();
      if (window.showToast) window.showToast('Kullanıcı silindi.');
    }
  }

  openAddUserModal() {
    const name = prompt('Araştırmacı Adı Soyadı:');
    if (!name) return;
    const email = prompt('E-Posta Adresi:');
    if (!email) return;
    const inst = prompt('Kurum / Üniversite:') || 'Quantum Lab';

    const users = window.dataStore.getUsers();
    users.push({
      id: "usr-" + Date.now(),
      name: name.trim(),
      email: email.trim(),
      institution: inst.trim(),
      role: 'PhD Researcher',
      is_admin: false,
      can_publish: true,
      status: 'verified',
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: '👨‍🔬'
    });

    window.dataStore.saveUsers(users);
    this.renderUsers();
    this.updateKPIs();
    if (window.showToast) window.showToast(`Yeni araştırmacı (${name}) eklendi! 🎉`);
  }

  renderArticles() {
    if (!this.articlesTbody) return;

    const articles = window.dataStore.getArticles();

    if (articles.length === 0) {
      this.articlesTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--slate-medium); padding: 20px;">Sistemde makale bulunamadı.</td></tr>`;
      return;
    }

    this.articlesTbody.innerHTML = articles.map(art => `
      <tr>
        <td><strong>${art.title}</strong></td>
        <td>${art.author}</td>
        <td><span class="badge" style="font-size: 0.72rem;">${art.category}</span></td>
        <td style="font-size: 0.8rem; color: var(--slate-light);">${art.date}</td>
        <td style="font-size: 0.84rem; font-weight: 700; color: var(--crimson-bright);">👏 ${art.claps || 0}</td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 4px;">
            <a href="articles.html" class="btn btn-outline btn-sm" style="padding: 3px 8px; font-size: 0.76rem;">
              Sitede Gör
            </a>
            <button class="btn btn-outline btn-sm" style="padding: 3px 8px; font-size: 0.76rem; color: var(--crimson-bright);" onclick="window.adminConsole.deleteArticle('${art.id}')">
              Sil
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  deleteArticle(artId) {
    if (confirm('Bu makaleyi silmek istediğinize emin misiniz?')) {
      window.dataStore.deleteArticle(artId);
      this.renderArticles();
      this.updateKPIs();
      if (window.showToast) window.showToast('Makale silindi.');
    }
  }

  downloadSqlBackup() {
    window.location.href = 'schema.sql';
    if (window.showToast) window.showToast('MySQL şeması indiriliyor (schema.sql)... 💾');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.adminConsole = new AdminConsole();
});
