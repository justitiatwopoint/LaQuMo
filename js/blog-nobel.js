/* ==========================================================================
   NOBEL PHYSICS TIMELINE RENDERER (js/blog-nobel.js)
   Renders window.NOBEL_PHYSICS into #nobel-timeline with search + era filter.
   ========================================================================== */

(function () {
  const DATA = window.NOBEL_PHYSICS || [];
  const WOMEN = new Set(window.NOBEL_PHYSICS_WOMEN || []);
  const LATEST = DATA.length ? DATA[DATA.length - 1].year : null;

  const ERAS = [
    { id: "all", label: "All", from: 0, to: 9999 },
    { id: "e1", label: "1901–1925", from: 1901, to: 1925 },
    { id: "e2", label: "1926–1950", from: 1926, to: 1950 },
    { id: "e3", label: "1951–1975", from: 1951, to: 1975 },
    { id: "e4", label: "1976–2000", from: 1976, to: 2000 },
    { id: "e5", label: "2001–2026", from: 2001, to: 2026 }
  ];

  const state = { era: "all", query: "" };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Accent-insensitive normalisation so "rontgen" finds "Röntgen"
  function norm(s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  function highlight(text, q) {
    if (!q) return esc(text);
    const n = norm(text);
    const i = n.indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  }

  /* ---- Stats ---- */
  function renderStats() {
    const awarded = DATA.filter(d => !d.none);
    const allNames = awarded.flatMap(d => d.awards.flatMap(a => a.names));
    const unique = new Set(allNames);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("stat-prizes", awarded.length);
    set("stat-laureates", unique.size);
    set("stat-none", DATA.length - awarded.length);
    set("stat-women", [...unique].filter(n => WOMEN.has(n)).length);
  }

  /* ---- Era chips ---- */
  function renderChips() {
    const wrap = document.getElementById("era-chips");
    if (!wrap) return;
    wrap.innerHTML = ERAS.map(e =>
      `<button type="button" class="era-chip" data-era="${e.id}" aria-pressed="${e.id === state.era}">${e.label}</button>`
    ).join("");
    wrap.addEventListener("click", ev => {
      const btn = ev.target.closest(".era-chip");
      if (!btn) return;
      state.era = btn.dataset.era;
      wrap.querySelectorAll(".era-chip").forEach(b => b.setAttribute("aria-pressed", b === btn));
      renderTimeline();
    });
  }

  /* ---- Timeline ---- */
  function matches(entry, q) {
    if (!q) return true;
    if (String(entry.year).includes(q)) return true;
    if (entry.none) return false;
    return entry.awards.some(a => a.names.some(n => norm(n).includes(q)) || norm(a.why).includes(q));
  }

  function yearHTML(entry, q) {
    const isLatest = entry.year === LATEST;
    if (entry.none) {
      return `<article class="nobel-year is-none" id="y${entry.year}">
        <div class="nobel-year-num">${entry.year}</div>
        <div><div class="nobel-why">No prize awarded</div></div>
      </article>`;
    }
    const awards = entry.awards.map(a => {
      const names = a.names.map(n => {
        const h = highlight(n, q);
        return WOMEN.has(n) ? `<span class="woman" title="Woman laureate">${h}</span>` : h;
      }).join(", ");
      return `<div class="nobel-award">
        <div class="nobel-names">${names}</div>
        <div class="nobel-why">${highlight(a.why, q)}</div>
      </div>`;
    }).join("");
    return `<article class="nobel-year${isLatest ? " is-latest" : ""}" id="y${entry.year}">
      <div class="nobel-year-num">${entry.year}${isLatest ? '<br><span class="nobel-badge" style="margin-left:0">Latest</span>' : ""}</div>
      <div>${awards}</div>
    </article>`;
  }

  function renderTimeline() {
    const host = document.getElementById("nobel-timeline");
    const countEl = document.getElementById("nobel-count");
    if (!host) return;
    const era = ERAS.find(e => e.id === state.era) || ERAS[0];
    const q = norm(state.query.trim());

    const rows = DATA.filter(d => d.year >= era.from && d.year <= era.to && matches(d, q));

    if (!rows.length) {
      host.innerHTML = `<div class="nobel-empty">No laureates match “${esc(state.query)}”.</div>`;
      if (countEl) countEl.textContent = "0 years shown";
      return;
    }

    // Group by decade
    const groups = new Map();
    rows.forEach(r => {
      const dec = Math.floor(r.year / 10) * 10;
      if (!groups.has(dec)) groups.set(dec, []);
      groups.get(dec).push(r);
    });

    host.innerHTML = [...groups.entries()].map(([dec, items]) =>
      `<section class="nobel-decade">
        <h2 class="nobel-decade-title">${dec}s</h2>
        ${items.map(i => yearHTML(i, q)).join("")}
      </section>`
    ).join("");

    if (countEl) {
      const people = rows.filter(r => !r.none).reduce((s, r) => s + r.awards.reduce((t, a) => t + a.names.length, 0), 0);
      countEl.textContent = `${rows.length} year${rows.length === 1 ? "" : "s"} shown · ${people} laureate entr${people === 1 ? "y" : "ies"}`;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderStats();
    renderChips();
    renderTimeline();
    const input = document.getElementById("nobel-search");
    if (input) {
      input.addEventListener("input", () => { state.query = input.value; renderTimeline(); });
    }
  });
})();
