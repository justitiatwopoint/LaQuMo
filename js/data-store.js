/* ==========================================================================
   LAQUMO CENTRAL DATA STORE & STATE MANAGER (js/data-store.js)
   Single source of truth for Users, Articles, Simulations & Comments
   ========================================================================== */

class DataStoreManager {
  constructor() {
    this.storageUsersKey = 'laqumo_users';
    this.storageSessionKey = 'laqumo_auth_user';
    this.storageArticlesKey = 'laqumo_articles';
    this.storageSimsKey = 'laqumo_simulations';
    this.storageCommentsKey = 'laqumo_comments';

    this.initDefaultData();
  }

  initDefaultData() {
    // 1. Initial Users
    if (!localStorage.getItem(this.storageUsersKey)) {
      const defaultUsers = [
        {
          id: "usr-001",
          email: "feynman@quantum-lab.org",
          name: "Dr. Richard Feynman",
          institution: "Institute for Advanced Quantum Physics",
          role: "Professor / PI",
          is_admin: true,
          can_publish: true,
          status: "verified",
          joinedDate: "2026-01-10",
          avatar: "👨‍🏫",
          bio: "Kuantum mekaniği, yol integralleri ve kuantum hesaplama öncüsü."
        },
        {
          id: "usr-002",
          email: "curie@sorbonne-quantum.fr",
          name: "Marie Curie",
          institution: "Sorbonne Quantum Research",
          role: "Postdoctoral Scholar",
          is_admin: false,
          can_publish: true,
          status: "verified",
          joinedDate: "2026-02-04",
          avatar: "👩‍🔬",
          bio: "Radyoaktivite ve kuantum durum geçişleri uzmanı."
        },
        {
          id: "usr-003",
          email: "bohr@copenhagen-lab.dk",
          name: "Niels Bohr",
          institution: "Copenhagen Institute of Theoretical Physics",
          role: "PhD Researcher",
          is_admin: false,
          can_publish: true,
          status: "pending",
          joinedDate: "2026-03-12",
          avatar: "🧑‍🔬",
          bio: "Atomik yörünge enerji seviyeleri ve tamamlayıcılık ilkesi."
        }
      ];
      localStorage.setItem(this.storageUsersKey, JSON.stringify(defaultUsers));
    }

    // 2. Default Active Session
    if (!localStorage.getItem(this.storageSessionKey)) {
      const users = this.getUsers();
      localStorage.setItem(this.storageSessionKey, JSON.stringify(users[0]));
    }

    // 3. Initial Articles
    if (!localStorage.getItem(this.storageArticlesKey)) {
      const defaultArticles = [
        {
          id: "art-001",
          title: "Variational Quantum Eigensolver (VQE) ile Moleküler Taban Durumları",
          author: "Dr. Richard Feynman",
          institution: "Institute for Advanced Quantum Physics",
          date: "2026-08-20",
          read_time: "12 dk okuma",
          category: "Quantum Chemistry",
          tags: ["VQE", "Ansatz", "LiH", "PennyLane"],
          abstract: "Lityum Hidrür (LiH) molekülünün potansiyel enerji yüzeyini Jordan-Wigner dönüşümü ve UCCSD Ansatz ile çözen hibrit algoritma yaklaşımı.",
          formula: "\\langle \\hat{\\mathcal{H}} \\rangle(\\vec{\\theta}) = \\langle 0|^{\\otimes q} U^\\dagger(\\vec{\\theta}) \\hat{\\mathcal{H}} U(\\vec{\\theta}) |0\\rangle^{\\otimes q} \\ge E_0",
          content: "Kuantum kimyasında moleküler taban durumu enerjisi $E_0$, Schrödinger denkleminin tam çözümünü gerektirir. Klasik bilgisayarlar elektron korelasyonlarını simüle ederken eksponansiyel Hilbert uzayı duvarına $(2^N)$ çarpar. Variational Quantum Eigensolver (VQE), Rayleigh-Ritz varyasyonel prensibini kullanarak bu hesaplamayı klasik bir optimizasyon döngüsü ile kuantum devresi parametreleri arasında paylaştırır.",
          claps: 54,
          sim_target: "lab.html"
        },
        {
          id: "art-002",
          title: "QuEra Bloqade ile 2D Rydberg Blokajı ve Graf Optimizasyonu (MIS)",
          author: "Marie Curie",
          institution: "Sorbonne Quantum Research",
          date: "2026-08-18",
          read_time: "10 dk okuma",
          category: "Neutral Atom Physics",
          tags: ["QuEra", "Bloqade", "Rydberg", "Aquila"],
          abstract: "256 Rubidyum-87 nötr atomunun optik cımbızlarla 2D dizilimi ve Van der Waals $C_6/R^6$ etkileşimi ile Maksimum Bağımsız Küme (MIS) problemlerinin çözümü.",
          formula: "\\hat{\\mathcal{H}}_{Rydberg} = \\sum_i \\frac{\\Omega(t)}{2}\\hat{\\sigma}_i^x - \\sum_i \\Delta(t)\\hat{n}_i + \\sum_{i<j}\\frac{C_6}{|\\vec{r}_i-\\vec{r}_j|^6}\\hat{n}_i\\hat{n}_j",
          content: "Nötr atom tabanlı analog kuantum işlemciler (QuEra Aquila gibi), lazer cımbızları ile tek tek tutulan Rubidyum atomlarının Rydberg durumuna uyarılması prensibiyle çalışır. İki atom birbirine Rydberg blokaj yarıçapı mesafesinden daha yakınsa, aynı anda uyarılmaları engellenir. Bu mekanizma kombinatoryal graf problemlerini çözer.",
          claps: 38,
          sim_target: "lab.html"
        },
        {
          id: "art-003",
          title: "Kitaev Zincirinde Majorana Sıfır Modları ve Parite Koruması",
          author: "Dr. Richard Feynman",
          institution: "Institute for Advanced Quantum Physics",
          date: "2026-08-11",
          read_time: "14 dk okuma",
          category: "Topological Matter",
          tags: ["Majorana", "Kitaev", "Topological Qubits"],
          abstract: "1 Boyutlu p-dalga süperiletken zincirlerin uç noktalarında ortaya çıkan sıfır enerjili Majorana fermiyonlarının yerel gürültülere karşı kuantum hafızasını koruma mekanizması.",
          formula: "\\gamma_{2j-1} = c_j + c_j^\\dagger, \\quad \\gamma_{2j} = -i(c_j - c_j^\\dagger)",
          content: "Majorana sıfır modları kendi kendisinin antiparçacığı olan yarı-parçacıklardır. İki uzamsal olarak ayrılmış Majorana modunun oluşturduğu tek bir fermiyonik durum, kuantum bilgisini yerel olmayan bir parite biçiminde kodlar.",
          claps: 42,
          sim_target: "database.html"
        }
      ];
      localStorage.setItem(this.storageArticlesKey, JSON.stringify(defaultArticles));
    }

    // 4. Initial Simulations
    if (!localStorage.getItem(this.storageSimsKey)) {
      const defaultSims = [
        {
          id: "sim-1",
          name: "LiH VQE Molecular Energy",
          engine: "PennyLane VQE",
          params: "STO-3G, 4 Qubits, Shots: 1000",
          result: "⟨H⟩ = -7.8827 Hartree",
          date: "2026-08-25 10:30"
        },
        {
          id: "sim-2",
          name: "QuEra 16-Atom 2D Rydberg Array",
          engine: "QuEra Bloqade",
          params: "Ω = 2.5 rad/μs, Δ = 1.2, Rb = 7.6 μm",
          result: "16 Atoms, MIS Validated",
          date: "2026-08-24 16:15"
        },
        {
          id: "sim-3",
          name: "Schrödinger Double Barrier Resonant Tunneling",
          engine: "Wave Mechanics",
          params: "V0 = 45 eV, k0 = 0.55",
          result: "Transmission T = 32.4%",
          date: "2026-08-23 14:00"
        }
      ];
      localStorage.setItem(this.storageSimsKey, JSON.stringify(defaultSims));
    }
  }

  // --- USER METHODS ---
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.storageUsersKey)) || [];
    } catch (e) {
      return [];
    }
  }

  saveUsers(users) {
    localStorage.setItem(this.storageUsersKey, JSON.stringify(users));
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(this.storageSessionKey));
    } catch (e) {
      return null;
    }
  }

  setCurrentUser(user) {
    localStorage.setItem(this.storageSessionKey, JSON.stringify(user));
  }

  updateCurrentUserProfile(data) {
    const user = this.getCurrentUser();
    if (!user) return false;

    const updated = { ...user, ...data };
    this.setCurrentUser(updated);

    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id || u.email === user.email);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      this.saveUsers(users);
    }
    return true;
  }

  toggleUserPerm(userId) {
    const users = this.getUsers();
    const u = users.find(x => x.id === userId);
    if (u) {
      u.can_publish = !u.can_publish;
      this.saveUsers(users);
      const curr = this.getCurrentUser();
      if (curr && curr.id === userId) {
        curr.can_publish = u.can_publish;
        this.setCurrentUser(curr);
      }
      return u.can_publish;
    }
    return null;
  }

  deleteUser(userId) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== userId);
    this.saveUsers(users);
  }

  // --- ARTICLE METHODS ---
  getArticles() {
    try {
      return JSON.parse(localStorage.getItem(this.storageArticlesKey)) || [];
    } catch (e) {
      return [];
    }
  }

  saveArticle(article) {
    const articles = this.getArticles();
    articles.unshift(article);
    localStorage.setItem(this.storageArticlesKey, JSON.stringify(articles));
  }

  deleteArticle(artId) {
    let articles = this.getArticles();
    articles = articles.filter(a => a.id !== artId);
    localStorage.setItem(this.storageArticlesKey, JSON.stringify(articles));
  }

  addClap(artId) {
    const articles = this.getArticles();
    const art = articles.find(a => a.id === artId);
    if (art) {
      art.claps = (art.claps || 0) + 1;
      localStorage.setItem(this.storageArticlesKey, JSON.stringify(articles));
      return art.claps;
    }
    return 0;
  }

  // --- SIMULATION METHODS ---
  getSimulations() {
    try {
      return JSON.parse(localStorage.getItem(this.storageSimsKey)) || [];
    } catch (e) {
      return [];
    }
  }

  saveSimulation(sim) {
    const sims = this.getSimulations();
    sims.unshift(sim);
    localStorage.setItem(this.storageSimsKey, JSON.stringify(sims));
  }

  deleteSimulation(simId) {
    let sims = this.getSimulations();
    sims = sims.filter(s => s.id !== simId);
    localStorage.setItem(this.storageSimsKey, JSON.stringify(sims));
  }
}

window.dataStore = new DataStoreManager();
