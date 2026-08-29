/* ==========================================================================
   LAQUMO 11-LANGUAGE INTERNATIONALIZATION (i18n) ENGINE (js/i18n.js)
   Languages: TR, EN, DE, FR, JA, ZH, KO, AR, RU, ES, IT
   ========================================================================== */

const I18N_LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'zh', name: '中文 (简体)', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', dir: 'ltr' }
];

const I18N_TRANSLATIONS = {
  tr: {
    nav_home: "Ana Sayfa",
    nav_lab: "Sanal Laboratuvar",
    nav_db: "Sistemler DB",
    nav_articles: "Makaleler & Akış",
    nav_sdk: "SDK Rehberi",
    nav_editor: "✍️ Editör",
    nav_dashboard: "Dashboard",
    nav_admin: "⚙️ Yönetim",
    hero_badge: "BÜYÜK KUANTUM MODELİ • BİLİMSEL PORTAL",
    hero_title_1: "Kuantum Fiziğinde Teori, Simülasyon & ",
    hero_title_2: "Akademik Yayıncılık",
    hero_desc: "Tarayıcı içi fizik dalga motorlarını, moleküler Hamiltonyenleri ve Evrim Ağacı tarzı hakemli bilimsel araştırma dergisini birleştiren yeni nesil hibrit kuantum mimarisi.",
    btn_launch_lab: "🧪 4'ü 1 Arada Laboratuvar",
    btn_read_articles: "📖 Bilimsel Makaleleri Oku",
    btn_write_paper: "✍️ Yeni Makale Yaz",
    btn_signin: "Giriş Yap",
    btn_signout: "Çıkış Yap",
    stat_qubits: "Kuantum Yazmaç Kapasitesi",
    stat_fidelity: "2-Qubit Kapı Doğruluğu",
    stat_sims: "İnteraktif Fizik Motoru",
    stat_speedup: "Hibrit Kuantum Hızlanması",
    sec_articles_tag: "// BİLİMSEL YAYIN AKIŞI",
    sec_articles_title: "Öne Çıkan Kuantum Makaleleri & Notlar",
    sec_articles_desc: "Fizikçiler ve araştırmacılar tarafından hazırlanan güncel makale ve incelemeler.",
    sec_sim_tag: "// SANAL LABORATUVAR ÖNİZLEMESİ",
    sec_sim_title: "İnteraktif 3D Bloch Küresi & Qubit Manipülasyonu",
    sec_sim_desc: "Kuantum durum vektörünü farenizle 3 boyutta döndürün, üniter kapıları (H, X, Y, Z, S, T) uygulayın.",
    schrodinger_greeting: "Guten Tag! Ben Prof. Erwin Schrödinger 🎩🐱. LaQuMo Kuantum Laboratuvarı'na hoş geldiniz! Bana kuantum fiziğiyle ilgili dilediğinizi sorabilir veya doğrudan WhatsApp üzerinden araştırma ekibimize danışabilirsiniz!"
  },
  en: {
    nav_home: "Home",
    nav_lab: "Virtual Lab",
    nav_db: "Systems DB",
    nav_articles: "Articles & Feed",
    nav_sdk: "SDK Directory",
    nav_editor: "✍️ Editor",
    nav_dashboard: "Dashboard",
    nav_admin: "⚙️ Admin Console",
    hero_badge: "LARGE QUANTUM MODEL • SCIENTIFIC PORTAL",
    hero_title_1: "Theory, Simulation & Academic Publication in ",
    hero_title_2: "Quantum Physics",
    hero_desc: "A state-of-the-art hybrid quantum architecture combining in-browser physical wave engines, molecular Hamiltonians, and an Evrim Ağacı-style peer-reviewed research magazine.",
    btn_launch_lab: "🧪 4-in-1 Virtual Lab",
    btn_read_articles: "📖 Read Science Articles",
    btn_write_paper: "✍️ Write Manuscript",
    btn_signin: "Sign In",
    btn_signout: "Sign Out",
    stat_qubits: "Quantum Register Capacity",
    stat_fidelity: "2-Qubit Gate Fidelity",
    stat_sims: "Interactive Physics Engines",
    stat_speedup: "Hybrid Quantum Speedup",
    sec_articles_tag: "// SCIENTIFIC PUBLICATION FEED",
    sec_articles_title: "Featured Quantum Manuscripts & Notes",
    sec_articles_desc: "Peer-reviewed algorithm breakdowns, preprints, and research reviews.",
    sec_sim_tag: "// VIRTUAL LAB PREVIEW",
    sec_sim_title: "Interactive 3D Bloch Sphere & Qubit Controls",
    sec_sim_desc: "Rotate the 3D state vector with your mouse and apply unitary gates (H, X, Y, Z, S, T).",
    schrodinger_greeting: "Guten Tag! I am Prof. Erwin Schrödinger 🎩🐱. Welcome to LaQuMo Lab! Ask me any quantum physics question, or consult our team directly on WhatsApp!"
  },
  de: {
    nav_home: "Startseite",
    nav_lab: "Virtuelles Labor",
    nav_db: "Systemdatenbank",
    nav_articles: "Artikel & Feed",
    nav_sdk: "SDK-Verzeichnis",
    nav_editor: "✍️ Editor",
    nav_dashboard: "Dashboard",
    nav_admin: "⚙️ Admin-Konsole",
    hero_badge: "GROSSES QUANTENMODELL • WISSENSCHAFTSPORTAL",
    hero_title_1: "Theorie, Simulation & Akademische Publikation in der ",
    hero_title_2: "Quantenphysik",
    hero_desc: "Eine hochmoderne hybride Quantenarchitektur, die physikalische Wellensimulationen im Browser, molekulare Hamiltonoperatoren und ein wissenschaftliches Forschungsmagazin vereint.",
    btn_launch_lab: "🧪 4-in-1 Virtuelles Labor",
    btn_read_articles: "📖 Wissenschaftliche Artikel",
    btn_write_paper: "✍️ Manuskript verfassen",
    btn_signin: "Anmelden",
    btn_signout: "Abmelden",
    stat_qubits: "Quantenregister-Kapazität",
    stat_fidelity: "2-Qubit Gatter-Fidelität",
    stat_sims: "Interaktive Physik-Engines",
    stat_speedup: "Hybride Quantenbeschleunigung",
    sec_articles_tag: "// WISSENSCHAFTLICHER FEED",
    sec_articles_title: "Ausgewählte Quantenartikel & Notizen",
    sec_articles_desc: "Peer-Review-Algorithmen und Forschungsnotizen von Physikern.",
    sec_sim_tag: "// VORSCHAU DES VIRTUELLEN LABORS",
    sec_sim_title: "Interaktive 3D-Bloch-Kugel & Qubit-Steuerung",
    sec_sim_desc: "Drehen Sie den Zustandsvektor in 3D und wenden Sie unitäre Gatter an.",
    schrodinger_greeting: "Guten Tag! Ich bin Prof. Erwin Schrödinger 🎩🐱. Willkommen im LaQuMo-Labor! Fragen Sie mich alles über Quantenphysik!"
  },
  fr: {
    nav_home: "Accueil",
    nav_lab: "Laboratoire Virtuel",
    nav_db: "Base de Données",
    nav_articles: "Articles & Flux",
    nav_sdk: "Répertoire SDK",
    nav_editor: "✍️ Éditeur",
    nav_dashboard: "Tableau de Bord",
    nav_admin: "⚙️ Console Admin",
    hero_badge: "GRAND MODÈLE QUANTIQUE • PORTAIL SCIENTIFIQUE",
    hero_title_1: "Théorie, Simulation & Publication Académique en ",
    hero_title_2: "Physique Quantique",
    hero_desc: "Une architecture quantique hybride de pointe combinant des moteurs d'ondes physiques dans le navigateur, des hamiltoniens moléculaires et un magazine de recherche revu par des pairs.",
    btn_launch_lab: "🧪 Labo Virtuel 4-en-1",
    btn_read_articles: "📖 Lire les Articles",
    btn_write_paper: "✍️ Écrire un Article",
    btn_signin: "Se Connecter",
    btn_signout: "Déconnexion",
    stat_qubits: "Capacité des Registres Quantiques",
    stat_fidelity: "Fidélité des Portes à 2 Qubits",
    stat_sims: "Moteurs Physiques Interactifs",
    stat_speedup: "Accélération Quantique Hybride",
    sec_articles_tag: "// FLUX DE PUBLICATIONS SCIENTIFIQUES",
    sec_articles_title: "Articles & Notes de Recherche Quantique",
    sec_articles_desc: "Analyses d'algorithmes et notes de recherche préparées par des physiciens.",
    sec_sim_tag: "// APERÇU DU LABORATOIRE VIRTUEL",
    sec_sim_title: "Sphère de Bloch 3D Interactive & Portes Quantiques",
    sec_sim_desc: "Faites pivoter le vecteur d'état en 3D avec votre souris et appliquez des portes unitaires.",
    schrodinger_greeting: "Bonjour ! Je suis le Prof. Erwin Schrödinger 🎩🐱. Bienvenue au Laboratoire LaQuMo ! Posez-moi vos questions de physique quantique !"
  },
  ja: {
    nav_home: "ホーム",
    nav_lab: "バーチャルラボ",
    nav_db: "量子システムDB",
    nav_articles: "論文＆フィード",
    nav_sdk: "SDKディレクトリ",
    nav_editor: "✍️ 論文エディタ",
    nav_dashboard: "ダッシュボード",
    nav_admin: "⚙️ 管理コンソール",
    hero_badge: "大規模量子モデル • 学術ポータル",
    hero_title_1: "量子物理学における理論・シミュレーション＆",
    hero_title_2: "学術出版プラットフォーム",
    hero_desc: "ブラウザ上で動作する物理波動シミュレータ、分子ハミルトニアン、査読付き学術雑誌を統合した次世代ハイブリッド量子プラットフォーム。",
    btn_launch_lab: "🧪 4-in-1 バーチャルラボ",
    btn_read_articles: "📖 論文を読む",
    btn_write_paper: "✍️ 論文を執筆する",
    btn_signin: "ログイン",
    btn_signout: "ログアウト",
    stat_qubits: "量子レジスタ容量",
    stat_fidelity: "2量子ビットゲート忠実度",
    stat_sims: "対話型物理エンジン",
    stat_speedup: "ハイブリッド量子高速化",
    sec_articles_tag: "// 学術論文フィード",
    sec_articles_title: "注目の量子論文＆研究ノート",
    sec_articles_desc: "物理学者や研究者による最新の論文とアルゴリズム解説。",
    sec_sim_tag: "// バーチャルラボプレビュー",
    sec_sim_title: "インタラクティブ3Dブロッホ球＆量子ゲート",
    sec_sim_desc: "マウス操作で状態ベクトルを3次元回転し、量子ゲートを適用できます。",
    schrodinger_greeting: "グーテン・ターク！エルヴィン・シュレーディンガー教授です 🎩🐱。LaQuMo量子ラボへようこそ！量子力学のことなら何でも聞いてください！"
  },
  zh: {
    nav_home: "首页",
    nav_lab: "虚拟实验室",
    nav_db: "量子系统数据库",
    nav_articles: "学术文章与动态",
    nav_sdk: "量子SDK目录",
    nav_editor: "✍️ 论文编辑器",
    nav_dashboard: "研究仪表盘",
    nav_admin: "⚙️ 管理控制台",
    hero_badge: "大模型量子物理 • 科学门户",
    hero_title_1: "量子物理学的理论推导、前沿模拟与",
    hero_title_2: "学术出版生态",
    hero_desc: "将浏览器端物理波函数模拟器、分子哈密顿量数据库与同行评审期刊融为一体的下一代混合量子计算科学平台。",
    btn_launch_lab: "🧪 4合1 虚拟实验室",
    btn_read_articles: "📖 阅读科研论文",
    btn_write_paper: "✍️ 撰写学术手稿",
    btn_signin: "登录",
    btn_signout: "退出登录",
    stat_qubits: "量子寄存器容量",
    stat_fidelity: "双量子比特门保真度",
    stat_sims: "交互式物理引擎",
    stat_speedup: "混合量子加速比",
    sec_articles_tag: "// 科学出版动态",
    sec_articles_title: "精选量子前沿文章与手记",
    sec_articles_desc: "由量子物理学家与博士研究人员撰写的算法解析与预印本。",
    sec_sim_tag: "// 虚拟实验室预览",
    sec_sim_title: "交互式 3D 布洛赫球面与量子逻辑门",
    sec_sim_desc: "使用鼠标在三维空间旋转量子态矢量，实时应用酉变换门。",
    schrodinger_greeting: "您好！我是埃尔温·薛定谔教授 🎩🐱。欢迎来到 LaQuMo 量子实验室！随时向我咨询量子力学问题，或通过 WhatsApp 直接与团队交流！"
  },
  ko: {
    nav_home: "홈",
    nav_lab: "가상 실험실",
    nav_db: "양자 시스템 DB",
    nav_articles: "논문 및 피드",
    nav_sdk: "SDK 디렉터리",
    nav_editor: "✍️ 논문 편집기",
    nav_dashboard: "대시보드",
    nav_admin: "⚙️ 관리 콘솔",
    hero_badge: "거대 양자 모델 • 학술 포털",
    hero_title_1: "양자 물리학 이론, 시뮬레이션 및 ",
    hero_title_2: "학술 출판 플랫폼",
    hero_desc: "브라우저 기반 물리 파동 시뮬레이터, 분자 해밀토니언 데이터베이스 및 동료 평가 학술지를 통합한 차세대 하이브리드 양자 플랫폼.",
    btn_launch_lab: "🧪 4-in-1 가상 실험실",
    btn_read_articles: "📖 과학 논문 읽기",
    btn_write_paper: "✍️ 새 논문 작성",
    btn_signin: "로그인",
    btn_signout: "로그아웃",
    stat_qubits: "양자 레지스터 용량",
    stat_fidelity: "2-큐비트 게이트 충실도",
    stat_sims: "인터랙티브 물리 엔진",
    stat_speedup: "하이브리드 양자 가속",
    sec_articles_tag: "// 학술 논문 피드",
    sec_articles_title: "주목할 만한 양자 논문 및 연구 노트",
    sec_articles_desc: "물리학자 및 연구진이 작성한 최신 알고리즘 분석 및 프리프린트.",
    sec_sim_tag: "// 가상 실험실 미리보기",
    sec_sim_title: "인터랙티브 3D 블로흐 구면 및 큐비트 제어",
    sec_sim_desc: "마우스로 3차원 상태 벡터를 회전하고 단일 큐비트 게이트를 적용해보세요.",
    schrodinger_greeting: "안녕하세요! 에르빈 슈뢰딩거 교수입니다 🎩🐱. LaQuMo 양자 연구소에 오신 것을 환영합니다! 양자 물리학에 대해 무엇이든 물어보세요!"
  },
  ar: {
    nav_home: "الرئيسية",
    nav_lab: "المختبر الافتراضي",
    nav_db: "قاعدة بيانات الأنظمة",
    nav_articles: "المقالات والبحوث",
    nav_sdk: "دليل حزم البرمجيات",
    nav_editor: "✍️ محرر البحوث",
    nav_dashboard: "لوحة التحكم",
    nav_admin: "⚙️ لوحة الإدارة",
    hero_badge: "نموذج الكم الضخم • البوابة العلمية",
    hero_title_1: "النظرية والمحاكاة والنشر الأكاديمي في ",
    hero_title_2: "فيزياء الكم",
    hero_desc: "منصة كمومية هجينة متطورة تجمع بين محاكاة الموجات الفيزيائية في المتصفح وهاميلتونيان الجزيئات ومجلة بحثية محكمة.",
    btn_launch_lab: "🧪 المختبر الافتراضي 4 في 1",
    btn_read_articles: "📖 قراءة المقالات العلمية",
    btn_write_paper: "✍️ كتابة بحث جديد",
    btn_signin: "تسجيل الدخول",
    btn_signout: "تسجيل الخروج",
    stat_qubits: "سعة السجلات الكمومية",
    stat_fidelity: "دقة بوابات 2-كيوبت",
    stat_sims: "محركات فيزيائية تفاعلية",
    stat_speedup: "تسريع الحوسبة الكمومية الهجينة",
    sec_articles_tag: "// موجز المنشورات العلمية",
    sec_articles_title: "أبرز الأبحاث والمقالات الكمومية",
    sec_articles_desc: "تحليلات الخوارزميات وملاحظات أبحاث الدكتوراه المعدة من قبل الفيزيائيين.",
    sec_sim_tag: "// معاينة المختبر الافتراضي",
    sec_sim_title: "كرة بلوخ ثلاثية الأبعاد التفاعلية والتحكم بالكيوبت",
    sec_sim_desc: "قم بتدوير متجه الحالة ثلاثي الأبعاد بالفأرة وتطبيق البوابات الكمومية الموحدة.",
    schrodinger_greeting: "مرحباً بكم! أنا البروفيسور إرفين شرودنغر 🎩🐱. أهلاً بكم في مختبر LaQuMo الكمومي! اسألني عن أي شيء في ميكانيكا الكم!"
  },
  ru: {
    nav_home: "Главная",
    nav_lab: "Виртуальная Лаборатория",
    nav_db: "База Систем",
    nav_articles: "Статьи и Публикации",
    nav_sdk: "Каталог SDK",
    nav_editor: "✍️ Редактор",
    nav_dashboard: "Панель Исследователя",
    nav_admin: "⚙️ Админ-панель",
    hero_badge: "БОЛЬШАЯ КВАНТОВАЯ МОДЕЛЬ • НАУЧНЫЙ ПОРТАЛ",
    hero_title_1: "Теория, Моделирование и Научные Публикации по ",
    hero_title_2: "Квантовой Физике",
    hero_desc: "Передовая гибридная квантовая архитектура, объединяющая браузерные симуляторы волновых уравнений, молекулярные гамильтонианы и научный рецензируемый журнал.",
    btn_launch_lab: "🧪 Лаборатория 4-в-1",
    btn_read_articles: "📖 Читать Статьи",
    btn_write_paper: "✍️ Написать Статью",
    btn_signin: "Войти",
    btn_signout: "Выйти",
    stat_qubits: "Емкость Квантовых Регистров",
    stat_fidelity: "Точность 2-кубитных Вентилей",
    stat_sims: "Интерактивных Физических Движка",
    stat_speedup: "Гибридное Квантовое Ускорение",
    sec_articles_tag: "// ЛЕНТА НАУЧНЫХ ПУБЛИКАЦИЙ",
    sec_articles_title: "Избранные Квантовые Статьи и Заметки",
    sec_articles_desc: "Анализ квантовых алгоритмов и препринты от ведущих исследователей.",
    sec_sim_tag: "// ПРЕДПРОСМОТР ЛАБОРАТОРИИ",
    sec_sim_title: "Интерактивная 3D Сфера Блоха и Кубиты",
    sec_sim_desc: "Вращайте вектор квантового состояния мышью в 3D и применяйте унитарные вентили.",
    schrodinger_greeting: "Гутен таг! Я профессор Эрвин Шрёдингер 🎩🐱. Добро пожаловать в квантовую лабораторию LaQuMo! Задайте мне любой вопрос о квантовой физике!"
  },
  es: {
    nav_home: "Inicio",
    nav_lab: "Laboratorio Virtual",
    nav_db: "Base de Datos",
    nav_articles: "Artículos y Feed",
    nav_sdk: "Directorio SDK",
    nav_editor: "✍️ Editor",
    nav_dashboard: "Panel de Usuario",
    nav_admin: "⚙️ Consola Admin",
    hero_badge: "GRAN MODELO CUÁNTICO • PORTAL CIENTÍFICO",
    hero_title_1: "Teoría, Simulación y Publicación Académica en ",
    hero_title_2: "Física Cuántica",
    hero_desc: "Una arquitectura cuántica híbrida de vanguardia que combina motores de ondas físicas en el navegador, hamiltonianos moleculares y una revista científica revisada por pares.",
    btn_launch_lab: "🧪 Laboratorio 4-en-1",
    btn_read_articles: "📖 Leer Artículos Científicos",
    btn_write_paper: "✍️ Escribir Artículo",
    btn_signin: "Iniciar Sesión",
    btn_signout: "Cerrar Sesión",
    stat_qubits: "Capacidad de Registros Cuánticos",
    stat_fidelity: "Fidelidad de Compuertas de 2 Qubits",
    stat_sims: "Motores Físicos Interactivos",
    stat_speedup: "Aceleración Cuántica Híbrida",
    sec_articles_tag: "// FEED DE PUBLICACIONES CIENTÍFICAS",
    sec_articles_title: "Artículos Cuánticos y Notas Destacadas",
    sec_articles_desc: "Desgloses de algoritmos y notas de investigación preparadas por físicos.",
    sec_sim_tag: "// VISTA PREVIA DEL LABORATORIO",
    sec_sim_title: "Esfera de Bloch 3D Interactiva y Controles de Qubits",
    sec_sim_desc: "Gire el vector de estado en 3D con su ratón y aplique compuertas unitarias.",
    schrodinger_greeting: "¡Guten Tag! Soy el Prof. Erwin Schrödinger 🎩🐱. ¡Bienvenido al Laboratorio LaQuMo! ¡Pregúnteme cualquier duda sobre física cuántica!"
  },
  it: {
    nav_home: "Home",
    nav_lab: "Laboratorio Virtuale",
    nav_db: "Database Sistemi",
    nav_articles: "Articoli & Feed",
    nav_sdk: "Directory SDK",
    nav_editor: "✍️ Editor",
    nav_dashboard: "Dashboard",
    nav_admin: "⚙️ Console Admin",
    hero_badge: "GRANDE MODELLO QUANTISTICO • PORTALE SCIENTIFICO",
    hero_title_1: "Teoria, Simulazione e Pubblicazione Accademica nella ",
    hero_title_2: "Fisica Quantistica",
    hero_desc: "Un'architettura quantistica ibrida all'avanguardia che unisce motori d'onda fisici in-browser, hamiltoniane molecolari e una rivista di ricerca peer-reviewed.",
    btn_launch_lab: "🧪 Laboratorio 4-in-1",
    btn_read_articles: "📖 Leggi gli Articoli",
    btn_write_paper: "✍️ Scrivi un Articolo",
    btn_signin: "Accedi",
    btn_signout: "Disconnetti",
    stat_qubits: "Capacità Registri Quantistici",
    stat_fidelity: "Fedeltà Porte a 2 Qubit",
    stat_sims: "Motori Fisici Interattivi",
    stat_speedup: "Accelerazione Quantistica Ibrida",
    sec_articles_tag: "// FEED PUBBLICAZIONI SCIENTIFICHE",
    sec_articles_title: "Articoli Quantistici in Evidenza",
    sec_articles_desc: "Analisi di algoritmi e note di ricerca preparate da fisici quantistici.",
    sec_sim_tag: "// ANTEPRIMA LABORATORIO VIRTUALE",
    sec_sim_title: "Sfera di Bloch 3D Interattiva & Porte Quantistiche",
    sec_sim_desc: "Ruota il vettore di stato in 3D con il mouse e applica porte unitarie.",
    schrodinger_greeting: "Guten Tag! Sono il Prof. Erwin Schrödinger 🎩🐱. Benvenuto nel Laboratorio LaQuMo! Fammi qualsiasi domanda di fisica quantistica!"
  }
};

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('laqumo_lang') || 'tr';
    this.init();
  }

  init() {
    this.renderLanguageSelector();
    this.applyLanguage(this.currentLang);
  }

  renderLanguageSelector() {
    // Render into any container with .lang-selector-wrap or create in navbar
    const containers = document.querySelectorAll('.lang-selector-wrap');
    if (containers.length === 0) {
      const navActions = document.querySelector('.nav-actions');
      if (navActions) {
        const wrap = document.createElement('div');
        wrap.className = 'lang-selector-wrap';
        navActions.insertBefore(wrap, navActions.firstChild);
      }
    }

    document.querySelectorAll('.lang-selector-wrap').forEach(wrap => {
      const currentLangObj = I18N_LANGUAGES.find(l => l.code === this.currentLang) || I18N_LANGUAGES[0];

      wrap.innerHTML = `
        <div class="lang-dropdown">
          <button class="lang-btn" id="lang-menu-btn" aria-label="Select Language">
            <span class="lang-flag">${currentLangObj.flag}</span>
            <span class="lang-code">${currentLangObj.code.toUpperCase()}</span>
            <span style="font-size: 0.65rem; margin-left: 2px;">▼</span>
          </button>
          <div class="lang-menu" id="lang-dropdown-menu">
            ${I18N_LANGUAGES.map(l => `
              <button class="lang-option ${l.code === this.currentLang ? 'active' : ''}" onclick="window.i18n.setLanguage('${l.code}')">
                <span>${l.flag}</span>
                <span>${l.name}</span>
                ${l.code === this.currentLang ? '<span style="margin-left: auto; color: var(--crimson-bright);">✓</span>' : ''}
              </button>
            `).join('')}
          </div>
        </div>
      `;

      const btn = wrap.querySelector('#lang-menu-btn');
      const menu = wrap.querySelector('#lang-dropdown-menu');
      if (btn && menu) {
        btn.onclick = (e) => {
          e.stopPropagation();
          menu.classList.toggle('open');
        };
      }
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.lang-menu').forEach(m => m.classList.remove('open'));
    });
  }

  setLanguage(code) {
    if (!I18N_TRANSLATIONS[code]) return;
    this.currentLang = code;
    localStorage.setItem('laqumo_lang', code);
    this.applyLanguage(code);
    this.renderLanguageSelector();

    const langObj = I18N_LANGUAGES.find(l => l.code === code);
    if (window.showToast) {
      window.showToast(`Language switched to ${langObj.flag} ${langObj.name}`);
    }
  }

  applyLanguage(code) {
    const dict = I18N_TRANSLATIONS[code] || I18N_TRANSLATIONS['en'];
    const langObj = I18N_LANGUAGES.find(l => l.code === code) || I18N_LANGUAGES[0];

    // Set document direction for Arabic (RTL) vs others (LTR)
    document.documentElement.setAttribute('dir', langObj.dir || 'ltr');
    document.documentElement.setAttribute('lang', code);

    // Replace all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Update Schrodinger Bot greeting if exists
    if (window.schrodingerBot && dict.schrodinger_greeting) {
      window.schrodingerBot.messages[0].text = dict.schrodinger_greeting;
      if (window.schrodingerBot.renderMessages) {
        window.schrodingerBot.renderMessages();
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.i18n = new I18nManager();
});
