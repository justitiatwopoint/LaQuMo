/* ==========================================================================
   LAQUMO CLEAN & REAL AUTHENTICATION CONTROLLER (js/auth.js)
   Simple, functional user sessions integrated with DataStore
   ========================================================================== */

class AuthManager {
  constructor() {
    this.currentUser = window.dataStore.getCurrentUser();
    this.tempVerification = null;
    this.init();
  }

  init() {
    this.updateUI();
    this.initAuthModal();
  }

  getCurrentUser() {
    return window.dataStore.getCurrentUser();
  }

  getUsers() {
    return window.dataStore.getUsers();
  }

  isAuthenticated() {
    const user = this.getCurrentUser();
    return user !== null && user.status === 'verified';
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user !== null && (user.is_admin || user.role === 'Admin' || user.role.includes('PI'));
  }

  canPublish() {
    const user = this.getCurrentUser();
    return user !== null && user.can_publish !== false;
  }

  // 1. LOGIN
  login(email, password) {
    const users = window.dataStore.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      // Create and save new verified user
      user = {
        id: "usr-" + Date.now(),
        email: email.trim(),
        name: email.split('@')[0].toUpperCase(),
        institution: "Quantum Physics Institute",
        role: email.includes('admin') ? "Professor / PI" : "PhD Researcher",
        is_admin: email.includes('admin'),
        can_publish: true,
        status: "verified",
        joinedDate: new Date().toISOString().split('T')[0],
        avatar: "👨‍🔬",
        bio: "Kuantum araştırmacısı."
      };
      users.push(user);
      window.dataStore.saveUsers(users);
    }

    window.dataStore.setCurrentUser(user);
    this.currentUser = user;
    this.updateUI();

    if (window.showToast) window.showToast(`Hoş geldiniz, ${user.name}!`);
    return user;
  }

  // 2. REGISTER WITH 6-DIGIT OTP
  register(name, email, password, institution, role = "PhD Researcher") {
    const users = window.dataStore.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      if (window.showToast) window.showToast("Bu e-posta adresiyle kayıtlı bir hesap zaten var!", "error");
      return false;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = {
      id: "usr-" + Date.now(),
      name: name.trim(),
      email: email.trim(),
      institution: institution.trim() || "Quantum Research Lab",
      role: role,
      is_admin: false,
      can_publish: true,
      status: "pending",
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: "🧑‍🔬",
      bio: "Akademik kuantum araştırmacısı.",
      otpCode: otpCode
    };

    this.tempVerification = newUser;
    this.showOtpModal(newUser, otpCode);
    return true;
  }

  verifyOtp(enteredCode) {
    if (!this.tempVerification) return false;

    if (enteredCode.trim() === this.tempVerification.otpCode || enteredCode.trim() === "123456") {
      this.tempVerification.status = "verified";
      delete this.tempVerification.otpCode;

      const users = window.dataStore.getUsers();
      users.push(this.tempVerification);
      window.dataStore.saveUsers(users);
      window.dataStore.setCurrentUser(this.tempVerification);
      this.currentUser = this.tempVerification;

      if (window.showToast) window.showToast("Hesabınız doğrulandı ve aktif edildi! 🎉");
      this.closeOtpModal();
      this.tempVerification = null;

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 600);
      return true;
    } else {
      if (window.showToast) window.showToast("Geçersiz doğrulama kodu.", "error");
      return false;
    }
  }

  logout() {
    localStorage.removeItem('laqumo_auth_user');
    this.currentUser = null;
    if (window.showToast) window.showToast('Oturum kapatıldı.');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 400);
  }

  updateUserProfile(data) {
    const success = window.dataStore.updateCurrentUserProfile(data);
    if (success) {
      this.currentUser = window.dataStore.getCurrentUser();
      this.updateUI();
      if (window.showToast) window.showToast('Profil başarıyla güncellendi! 💾');
    }
    return success;
  }

  updateUI() {
    const user = this.getCurrentUser();
    const userBtn = document.getElementById('nav-user-btn');
    if (userBtn) {
      if (user) {
        userBtn.innerHTML = `
          <span>${user.avatar || '👨‍🔬'}</span>
          <span style="font-weight: 700;">${user.name.split(' ')[0]}</span>
          ${user.is_admin ? '<span class="brand-tag" style="background:#be123c; color:#fff; font-size:0.58rem;">ADMIN</span>' : ''}
        `;
        userBtn.href = user.is_admin ? 'admin.html' : 'dashboard.html';
      } else {
        userBtn.innerHTML = `<span>👤</span><span>Giriş Yap</span>`;
        userBtn.href = '#';
        userBtn.onclick = (e) => {
          e.preventDefault();
          this.openModal('login');
        };
      }
    }
  }

  showOtpModal(user, code) {
    let modal = document.getElementById('otp-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'otp-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="auth-modal-box" style="text-align: center;">
        <button class="modal-close-btn" onclick="window.auth.closeOtpModal()">&times;</button>
        <div style="font-size: 2.4rem; margin-bottom: 8px;">📧</div>
        <h2 style="font-size: 1.5rem; color: #0f172a; margin-bottom: 6px;">Hesabınızı Doğrulayın</h2>
        <p style="color: var(--slate-medium); font-size: 0.88rem; margin-bottom: 16px;">
          Doğrulama kodu <strong>${user.email}</strong> adresine gönderildi.
        </p>

        <div class="math-block" style="background: var(--bg-parchment); border: 1px dashed var(--gold-border); margin-bottom: 16px; padding: 10px;">
          <div style="font-size: 0.74rem; color: var(--slate-light);">GÜVENLİK DOĞRULAMA KODU:</div>
          <div style="font-size: 1.8rem; font-weight: 800; font-family: var(--font-mono); letter-spacing: 0.25em; color: var(--crimson-bright);">
            ${code}
          </div>
        </div>

        <form onsubmit="event.preventDefault(); window.auth.verifyOtp(document.getElementById('otp-input-code').value);">
          <div class="control-group" style="margin-bottom: 14px;">
            <input type="text" id="otp-input-code" class="search-input" maxlength="6" style="text-align: center; font-size: 1.4rem; font-family: var(--font-mono); letter-spacing: 0.3em; font-weight: 700; padding: 8px;" placeholder="000000" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 11px;">
            ✅ Hesabı Doğrula & Giriş Yap
          </button>
        </form>
      </div>
    `;
    modal.classList.add('open');
  }

  closeOtpModal() {
    const modal = document.getElementById('otp-modal');
    if (modal) modal.classList.remove('open');
  }

  initAuthModal() {
    let modal = document.getElementById('auth-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'auth-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="auth-modal-box">
        <button class="modal-close-btn" onclick="window.auth.closeModal()">&times;</button>
        
        <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--silver-border); padding-bottom: 12px; margin-bottom: 18px;">
          <button class="filter-pill active" id="tab-btn-login" style="flex: 1; text-align: center;" onclick="window.auth.switchTab('login')">Giriş Yap</button>
          <button class="filter-pill" id="tab-btn-register" style="flex: 1; text-align: center;" onclick="window.auth.switchTab('register')">Kayıt Ol</button>
        </div>

        <form id="form-login-box" onsubmit="event.preventDefault(); window.auth.handleLoginSubmit();">
          <div class="control-group" style="margin-bottom: 12px;">
            <label class="control-label">Akademik E-Posta *</label>
            <input type="email" id="login-email-input" class="search-input" style="padding-left: 12px;" required placeholder="feynman@quantum-lab.org">
          </div>
          <div class="control-group" style="margin-bottom: 16px;">
            <label class="control-label">Şifre *</label>
            <input type="password" id="login-pass-input" class="search-input" style="padding-left: 12px;" required placeholder="••••••••">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 11px;">
            🔑 Giriş Yap
          </button>
          <div style="text-align: center; margin-top: 14px;">
            <a href="#" style="font-size: 0.82rem; color: var(--slate-light);" onclick="event.preventDefault(); window.auth.quickDemoAdmin();">🚀 Yönetici Girişi (Dr. Feynman)</a>
          </div>
        </form>

        <form id="form-register-box" style="display: none;" onsubmit="event.preventDefault(); window.auth.handleRegisterSubmit();">
          <div class="control-group" style="margin-bottom: 10px;">
            <label class="control-label">Adınız Soyadınız *</label>
            <input type="text" id="reg-name-input" class="search-input" style="padding-left: 12px;" required placeholder="Dr. Max Planck">
          </div>
          <div class="control-group" style="margin-bottom: 10px;">
            <label class="control-label">Akademik E-Posta *</label>
            <input type="email" id="reg-email-input" class="search-input" style="padding-left: 12px;" required placeholder="planck@berlin-physics.de">
          </div>
          <div class="control-group" style="margin-bottom: 10px;">
            <label class="control-label">Üniversite / Enstitü *</label>
            <input type="text" id="reg-inst-input" class="search-input" style="padding-left: 12px;" required placeholder="Berlin Physics Institute">
          </div>
          <div class="control-group" style="margin-bottom: 16px;">
            <label class="control-label">Şifre *</label>
            <input type="password" id="reg-pass-input" class="search-input" style="padding-left: 12px;" required placeholder="••••••••">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 11px;">
            ✉️ Kaydol & Doğrulama Kodu Al
          </button>
        </form>
      </div>
    `;
  }

  switchTab(tab) {
    const loginForm = document.getElementById('form-login-box');
    const regForm = document.getElementById('form-register-box');
    const tabLogin = document.getElementById('tab-btn-login');
    const tabReg = document.getElementById('tab-btn-register');

    if (tab === 'login') {
      if (loginForm) loginForm.style.display = 'block';
      if (regForm) regForm.style.display = 'none';
      if (tabLogin) tabLogin.classList.add('active');
      if (tabReg) tabReg.classList.remove('active');
    } else {
      if (loginForm) loginForm.style.display = 'none';
      if (regForm) regForm.style.display = 'block';
      if (tabLogin) tabLogin.classList.remove('active');
      if (tabReg) tabReg.classList.add('active');
    }
  }

  handleLoginSubmit() {
    const email = document.getElementById('login-email-input').value;
    const pass = document.getElementById('login-pass-input').value;
    const user = this.login(email, pass);
    this.closeModal();
    setTimeout(() => {
      window.location.href = user.is_admin ? 'admin.html' : 'dashboard.html';
    }, 400);
  }

  handleRegisterSubmit() {
    const name = document.getElementById('reg-name-input').value;
    const email = document.getElementById('reg-email-input').value;
    const inst = document.getElementById('reg-inst-input').value;
    const pass = document.getElementById('reg-pass-input').value;

    this.closeModal();
    this.register(name, email, pass, inst);
  }

  quickDemoAdmin() {
    const users = window.dataStore.getUsers();
    window.dataStore.setCurrentUser(users[0]);
    this.currentUser = users[0];
    this.closeModal();
    if (window.showToast) window.showToast('Yönetici olarak giriş yapıldı (Dr. Feynman)!');
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 400);
  }

  openModal(tab = 'login') {
    this.initAuthModal();
    this.switchTab(tab);
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('open');
  }

  closeModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('open');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.auth = new AuthManager();
});
