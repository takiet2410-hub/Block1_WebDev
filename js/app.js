/* NULL POINTER — Character Select portfolio. Data lives in data.js, 3D avatars in avatar3d.js. */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = $("#app");
  const dlg = $("#dlg");
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const pad = (n) => String(n).padStart(2, "0");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const total = CHARACTERS.length;
  const LEVELS = ["", "NOVICE", "APPRENTICE", "ADEPT", "ADVANCED", "EXPERT"];
  const A3D = window.Avatar3D; // undefined when WebGL / CDN unavailable → SVG fallback
  let current = 0;
  let booting = true;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  /* ---------- icons (Lucide paths) ---------- */
  const ICONS = {
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
    vol: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
    mute: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    auto: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    shuffle: '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  };
  const icon = (n) =>
    `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

  /* ---------- sound: synthesized, off by default ---------- */
  let soundOn = store.get("sound") === "on";
  let actx;
  function tone(freq, dur = 0.06, type = "square", vol = 0.035, to) {
    if (!soundOn) return;
    try {
      actx ||= new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime;
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx.destination);
      o.start(t);
      o.stop(t + dur);
    } catch {}
  }
  const sfx = {
    tick: () => tone(1400, 0.025, "square", 0.015),
    move: () => tone(220, 0.16, "sawtooth", 0.03, 880),
    select: () => { tone(660, 0.08); setTimeout(() => tone(990, 0.14), 70); },
    whoosh: () => tone(900, 0.3, "triangle", 0.03, 120),
    back: () => tone(520, 0.1, "triangle", 0.03, 260),
    start: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.12, "square", 0.03), i * 90)); },
  };

  const soundBtn = $("#sound");
  function renderSound() {
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    soundBtn.setAttribute("aria-label", `Âm thanh: ${soundOn ? "bật" : "tắt"}`);
    soundBtn.innerHTML = `${icon(soundOn ? "vol" : "mute")}<span>SOUND: ${soundOn ? "ON" : "OFF"}</span>`;
  }
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    store.set("sound", soundOn ? "on" : "off");
    renderSound();
    sfx.select();
  });

  /* ---------- theme: auto (system) → light → dark ---------- */
  const themeBtn = $("#theme");
  const sysLight = matchMedia("(prefers-color-scheme: light)");
  const MODES = ["auto", "light", "dark"];
  const MODE_VI = { auto: "theo hệ thống", light: "sáng", dark: "tối" };
  let themeMode = MODES.includes(store.get("theme")) ? store.get("theme") : "auto";
  const resolveTheme = () => (themeMode === "auto" ? (sysLight.matches ? "light" : "dark") : themeMode);

  function applyTheme() {
    const t = resolveTheme();
    root.dataset.theme = t;
    $('meta[name="theme-color"]').content = t === "light" ? "#EEF1F8" : "#07070F";
    const ic = { auto: "auto", light: "sun", dark: "moon" }[themeMode];
    themeBtn.innerHTML = `${icon(ic)}<span>THEME: ${themeMode.toUpperCase()}</span>`;
    themeBtn.setAttribute("aria-label", `Giao diện: ${MODE_VI[themeMode]}. Bấm để đổi`);
  }

  themeBtn.addEventListener("click", () => {
    const before = resolveTheme();
    themeMode = MODES[(MODES.indexOf(themeMode) + 1) % MODES.length];
    store.set("theme", themeMode);
    sfx.select();
    toast(`THEME: ${themeMode.toUpperCase()}${themeMode === "auto" ? ` (${resolveTheme().toUpperCase()})` : ""}`);
    // only animate when the colours actually change (e.g. auto → light on a light system does not)
    if (!document.startViewTransition || reduced || before === resolveTheme()) { applyTheme(); return; }
    // new theme spreads out in a circle from the button
    const r = themeBtn.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(applyTheme).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(.16, 1, .3, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  });
  sysLight.addEventListener("change", () => themeMode === "auto" && applyTheme());

  /* ---------- helpers ---------- */
  const announce = (msg) => { $("#sr").textContent = msg; };
  const setAccent = (c) => root.style.setProperty("--accent", c.color);

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }
  function copyEmail(email) {
    sfx.select();
    (navigator.clipboard ? navigator.clipboard.writeText(email) : Promise.reject())
      .then(() => toast(`ĐÃ COPY: ${email}`), () => toast(email));
  }

  // 3D avatar by default (avatar3d.js); SVG hologram bust if WebGL is unavailable.
  const EMBLEMS = [
    '<circle cx="200" cy="420" r="22"/>',
    '<path d="M200 394 226 420 200 446 174 420Z"/>',
    '<path d="M200 396 228 442H172Z"/>',
    '<path d="M200 394 223 407V433L200 446 177 433V407Z"/>',
  ];
  function art(c, decorative = false) {
    const a11y = decorative ? 'aria-hidden="true"' : `role="img" aria-label="Chân dung ${c.name}"`;
    if (c.image) {
      return `<img class="art-img" src="${c.image}" ${decorative ? 'alt=""' : `alt="Chân dung ${c.name}"`} width="400" height="520">`;
    }
    if (A3D) {
      if (!decorative) return `<div class="av3d" data-av="${c.id}"></div>`;
      const src = A3D.thumb(c);
      if (src) return `<img class="art-img" src="${src}" alt="" width="400" height="520">`;
    }
    const i = (c.id - 1) % EMBLEMS.length;
    return `<svg class="art-svg" viewBox="0 0 400 520" ${a11y}>
      <defs>
        <linearGradient id="g${c.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${c.color}" stop-opacity=".95"/>
          <stop offset="1" stop-color="${c.color}" stop-opacity=".04"/>
        </linearGradient>
        <pattern id="s${c.id}" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" style="fill:var(--scan)"/></pattern>
      </defs>
      <g fill="url(#g${c.id})" stroke="${c.color}" stroke-opacity=".7" stroke-width="2">
        <path d="M48 520C48 392 112 300 200 300S352 392 352 520Z"/>
        <rect x="172" y="232" width="56" height="78"/>
        <circle cx="200" cy="168" r="80"/>
      </g>
      <g fill="url(#s${c.id})"><path d="M48 520C48 392 112 300 200 300S352 392 352 520Z"/><circle cx="200" cy="168" r="80"/></g>
      <rect x="132" y="150" width="136" height="24" rx="3" style="fill:var(--bg)" stroke="${c.color}" stroke-width="2"/>
      <rect x="140" y="158" width="62" height="8" fill="${c.color}"/>
      <g fill="none" style="stroke:var(--text)" stroke-opacity=".9" stroke-width="3">${EMBLEMS[i]}</g>
    </svg>`;
  }

  // the live 3D model moves into whichever .av3d placeholder was just rendered
  function mount3D(scope = app) {
    const host = A3D && $(".av3d", scope);
    if (host) A3D.mount(host, CHARACTERS.find((c) => c.id === +host.dataset.av));
  }

  // n-axis radar of the stats object
  function radarHTML(c) {
    const e = Object.entries(c.stats), R = 46;
    const pt = (k, r) => {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / e.length;
      return [(Math.cos(a) * r).toFixed(1), (Math.sin(a) * r).toFixed(1)];
    };
    const ring = (f) => e.map((_, k) => pt(k, R * f).join(",")).join(" ");
    return `<svg class="radar" viewBox="-80 -64 160 128" role="img" aria-label="Biểu đồ chỉ số: ${e.map(([k, v]) => `${k} ${v}`).join(", ")}">
      ${[0.25, 0.5, 0.75, 1].map((f) => `<polygon class="radar-grid" points="${ring(f)}"/>`).join("")}
      ${e.map((_, k) => { const [x, y] = pt(k, R); return `<line class="radar-grid" x1="0" y1="0" x2="${x}" y2="${y}"/>`; }).join("")}
      <polygon class="radar-shape" points="${e.map(([, v], k) => pt(k, (R * v) / 100).join(",")).join(" ")}"/>
      ${e.map(([key], k) => { const [x, y] = pt(k, R + 13); return `<text x="${x}" y="${y}">${key}</text>`; }).join("")}
    </svg>`;
  }

  const statsHTML = (c) =>
    Object.entries(c.stats)
      .map(([k, v], i) => `<li class="stat"><span>${k}</span><span class="bar" aria-hidden="true"><i style="--v:${v / 100};--i:${i}"></i></span><b>${v}</b></li>`)
      .join("");

  const stageHTML = (c, i, cls = "") => `
    <div class="stage ${cls}">
      <div class="stage-ring" aria-hidden="true"></div>
      <span class="stage-num" data-f="num" aria-hidden="true">${pad(i + 1)}</span>
      <div class="frame" aria-hidden="true">
        <span class="label" data-f="tagTL">ID::${pad(c.id)} // ${c.short}</span>
        <span class="label" data-f="tagBR">SYNC ${Math.max(...Object.values(c.stats))}%</span>
      </div>
      <div class="art"><div class="art-inner" data-f="art">${art(c)}</div></div>
      ${A3D && !c.image ? `<span class="stage-hint label" aria-hidden="true">${icon("rotate")} KÉO ĐỂ XOAY</span>` : ""}
      <div class="floor" aria-hidden="true"></div>
    </div>`;

  function playSwap(el) {
    el.classList.remove("swap");
    void el.offsetWidth; // restart CSS animations
    el.classList.add("swap");
  }

  /* ---------- VIEW: team intro (landing page) ---------- */
  function renderTeam() {
    const words = TEAM.mission.split(" ");
    const mission = `${words.slice(0, -1).join(" ")} <em>${words.at(-1)}</em>`;
    const nProjects = CHARACTERS.reduce((n, c) => n + c.projects.length, 0);
    const nSkills = CHARACTERS.reduce((n, c) => n + c.tree.flat().length, 0);
    app.innerHTML = `
      <section class="team" id="team">
        <p class="label reveal">TEAM PROFILE</p>
        <h1 class="team-title glitch reveal" data-text="${TEAM.name}" tabindex="-1" style="--d:1">${TEAM.name}</h1>
        <p class="slogan reveal" style="--d:2">${TEAM.slogan}</p>
        <p class="team-intro muted reveal" style="--d:3">${TEAM.intro}</p>

        <dl class="team-stats reveal" style="--d:4">
          <div><dt class="label">THÀNH VIÊN</dt><dd>${pad(total)}</dd></div>
          <div><dt class="label">DỰ ÁN</dt><dd>${pad(nProjects)}</dd></div>
          <div><dt class="label">KỸ NĂNG</dt><dd>${pad(nSkills)}</dd></div>
        </dl>

        <div class="actions center reveal" style="--d:5">
          <a class="btn btn-primary" href="#/select"><span aria-hidden="true">[</span> CHỌN NHÂN VẬT <span aria-hidden="true">]</span></a>
        </div>

        <h2 class="sr-only">Thành viên</h2>
        <div class="lineup">
          ${CHARACTERS.map((c, i) => `
            <a class="member tinted" style="--accent:${c.color};--i:${i}" href="#/c/${c.id}" aria-label="${c.name}, ${c.role}. Xem hồ sơ">
              <span class="member-art">${art(c, true)}</span>
              <span class="member-code">${c.codename}</span>
              <span class="member-name">${c.name}</span>
              <span class="member-role">${c.short}</span>
            </a>`).join("")}
        </div>

        <ul class="values io" aria-label="Giá trị">
          ${TEAM.values.map((v) => `<li><b>${v.key}</b><span class="muted">${v.text}</span></li>`).join("")}
        </ul>

        <section class="quests io" aria-labelledby="q-h">
          <h2 class="quests-h" id="q-h">QUEST LOG</h2>
          <ol class="qlog">
            ${TEAM.quests.map((q) => `<li><span class="label">${q.when}</span><b>${q.title}</b><span class="muted">${q.text}</span></li>`).join("")}
          </ol>
        </section>

        <div class="mission io">
          <p class="label">MISSION</p>
          <p class="mission-text">${mission}</p>
          <div class="actions center">
            <a class="btn btn-primary" href="mailto:${TEAM.email}"><span aria-hidden="true">[</span> CONTACT <span aria-hidden="true">]</span></a>
            <button class="btn btn-ghost" type="button" data-copy="${TEAM.email}">${icon("copy")} COPY EMAIL</button>
          </div>
        </div>
      </section>`;
    $("[data-copy]", app).addEventListener("click", (e) => copyEmail(e.currentTarget.dataset.copy));
    playSwap($("#team"));
    observeReveals();
    $("#hud-view").textContent = "TEAM PROFILE";
  }

  /* ---------- VIEW: character select ---------- */
  function renderSelect() {
    const c = CHARACTERS[current];
    setAccent(c);
    app.innerHTML = `
      <section class="select" id="select" aria-labelledby="sel-title">
        <div class="sel-info">
          <p class="eyebrow label" style="--d:0">CHARACTER <span data-f="idx"></span> / ${pad(total)}</p>
          <h1 class="codename glitch" id="sel-title" tabindex="-1" data-f="code" style="--d:1"></h1>
          <p class="realname" data-f="name" style="--d:2"></p>
          <p class="role" data-f="role" style="--d:3"></p>
          <p class="tagline" data-f="tagline" style="--d:4"></p>
          <ul class="stats" data-f="stats" style="--d:5" aria-label="Chỉ số"></ul>
          <div class="actions" style="--d:6">
            <a class="btn btn-primary" data-f="go" href="#/c/${c.id}"><span aria-hidden="true">[</span> SELECT CHARACTER <span aria-hidden="true">]</span></a>
            <button class="btn btn-ghost" type="button" data-f="roll">${icon("shuffle")} RANDOM</button>
          </div>
          <p class="keys label" style="--d:7"><kbd>←</kbd><kbd>→</kbd> đổi &nbsp;·&nbsp; <kbd>ENTER</kbd> chọn &nbsp;·&nbsp; <kbd>R</kbd> ngẫu nhiên &nbsp;·&nbsp; <kbd>?</kbd> phím tắt</p>
        </div>
        ${stageHTML(c, current)}
        <nav class="roster" aria-label="Chọn nhân vật">
          <button class="nav-arrow" type="button" data-step="-1" aria-label="Nhân vật trước">${icon("left")}</button>
          <div class="slots">
            ${CHARACTERS.map((ch, i) => `
              <button class="slot tinted" type="button" style="--accent:${ch.color}" data-i="${i}" aria-pressed="false" aria-label="${ch.codename}, ${ch.role}">
                <span class="slot-num" aria-hidden="true">${pad(i + 1)}</span>${art(ch, true)}<span class="slot-name" aria-hidden="true">${ch.codename}</span>
              </button>`).join("")}
          </div>
          <button class="nav-arrow" type="button" data-step="1" aria-label="Nhân vật sau">${icon("right")}</button>
        </nav>
      </section>`;

    const sel = $("#select");
    sel.addEventListener("click", (e) => {
      const slot = e.target.closest(".slot");
      const arrow = e.target.closest(".nav-arrow");
      if (slot && +slot.dataset.i !== current) switchTo(+slot.dataset.i);
      if (arrow) switchTo(current + +arrow.dataset.step);
      if (e.target.closest('[data-f="go"]')) sfx.select();
      if (e.target.closest('[data-f="roll"]')) roll();
    });
    updateSelect();
    $("#hud-view").textContent = "CHARACTER SELECT";
  }

  function updateSelect() {
    const sel = $("#select");
    if (!sel) return;
    const c = CHARACTERS[current];
    const f = (k) => sel.querySelector(`[data-f="${k}"]`);
    f("idx").textContent = pad(current + 1);
    f("code").textContent = c.codename;
    f("code").dataset.text = c.codename;
    f("name").textContent = c.name;
    f("role").textContent = c.role;
    f("tagline").textContent = c.tagline;
    f("stats").innerHTML = statsHTML(c);
    f("go").href = `#/c/${c.id}`;
    f("num").textContent = pad(current + 1);
    f("tagTL").textContent = `ID::${pad(c.id)} // ${c.short}`;
    f("tagBR").textContent = `SYNC ${Math.max(...Object.values(c.stats))}%`;
    f("art").innerHTML = art(c);
    mount3D(sel);
    $$(".slot", sel).forEach((s, i) => s.setAttribute("aria-pressed", String(i === current)));
    playSwap(sel);
  }

  function switchTo(i) {
    current = (i + total) % total;
    const c = CHARACTERS[current];
    setAccent(c);
    updateSelect();
    sfx.move();
    announce(`${c.codename}, ${c.name}, ${c.role}`);
  }

  // slot-machine roulette over the roster, then lands on a different character
  let rolling = false;
  async function roll() {
    if (rolling) return;
    rolling = true;
    let i = current;
    const steps = reduced ? 1 : 12;
    for (let k = 0; k < steps; k++) {
      i = (i + 1 + Math.floor(Math.random() * (total - 1))) % total;
      if (reduced) break;
      $$(".slot").forEach((s, j) => s.classList.toggle("roll", j === i));
      sfx.tick();
      await wait(45 + k * 14);
    }
    $$(".slot").forEach((s) => s.classList.remove("roll"));
    rolling = false;
    if ($("#select")) switchTo(i);
  }

  /* ---------- VIEW: profile ---------- */
  function renderProfile(i) {
    current = i;
    const c = CHARACTERS[i];
    setAccent(c);
    const prev = CHARACTERS[(i - 1 + total) % total];
    const next = CHARACTERS[(i + 1) % total];
    const vals = Object.values(c.stats);
    const level = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);

    const tree = c.tree.map((tier) => `
      <div class="tier" style="--n:${tier.length}">
        ${tier.map((s) => `
          <button type="button" class="node">
            <span class="gem" style="--lv:${s.lv}" aria-hidden="true"></span>
            <span class="node-name">${s.name}</span>
            <span class="pips" aria-hidden="true">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= s.lv ? "on" : ""}"></i>`).join("")}</span>
            <span class="tip" role="tooltip">
              <b>${s.name}</b>
              <span class="label">LEVEL: ${LEVELS[s.lv]}</span>
              ${s.details.map((d) => `<span>› ${d}</span>`).join("")}
            </span>
          </button>`).join("")}
      </div>`).join("");

    const inv = c.projects.map((p, k) => `
      <button type="button" class="item" data-p="${k}">
        <span class="thumb">${p.image ? `<img src="${p.image}" alt="" width="640" height="400" loading="lazy">` : `<span class="rank" aria-hidden="true">${p.rank}</span>`}</span>
        <span class="item-body">
          <span class="label">ITEM ${pad(k + 1)} · RANK ${p.rank}</span>
          <span class="item-title">${p.title}</span>
          <span class="item-desc">${p.short}</span>
        </span>
      </button>`).join("");

    const card = c.photo ? `
        <section class="pf-sec io" aria-labelledby="card-h">
          <div class="sec-head"><h2 id="card-h">PLAYER CARD</h2><span class="label">REAL-WORLD AVATAR</span></div>
          <div class="pcard">
            <figure class="pcard-photo">
              <img src="${c.photo}" alt="Ảnh của ${c.name}" width="360" height="360" loading="lazy">
              <span class="pcard-foil" aria-hidden="true"></span>
              ${c.photoCaption ? `<figcaption class="label">${icon("pin")} ${c.photoCaption}</figcaption>` : ""}
            </figure>
            <div class="pcard-body">
              <p class="label">PLAYER ${pad(i + 1)} · ${c.className}</p>
              <p class="pcard-name">${c.name}</p>
              <p class="role">${c.role}</p>
              <dl class="pcard-meta">
                <div><dt class="label">CODENAME</dt><dd>${c.codename}</dd></div>
                <div><dt class="label">LEVEL</dt><dd>${level}</dd></div>
                <div><dt class="label">STATUS</dt><dd class="ok-text">ONLINE</dd></div>
              </dl>
              <p class="muted">${c.tagline}</p>
            </div>
          </div>
        </section>` : "";

    app.innerHTML = `
      <article class="profile" id="profile">
        <div class="pf-top reveal" style="--d:0">
          <a class="back" href="#/select">${icon("back")} BACK <kbd>ESC</kbd></a>
          <span class="label">CHARACTER ${pad(i + 1)} / ${pad(total)}</span>
        </div>
        <header class="pf-hero">
          ${stageHTML(c, i, "pf-stage")}
          <div class="pf-id">
            <p class="eyebrow label reveal" style="--d:1">${c.className}</p>
            <h1 class="codename glitch reveal" data-text="${c.codename}" tabindex="-1" style="--d:2">${c.codename}</h1>
            <p class="realname reveal" style="--d:3">${c.name}</p>
            <p class="role reveal" style="--d:4">${c.role}</p>
            <p class="bio reveal" style="--d:5">${c.bio}</p>
            <dl class="facts reveal" style="--d:6">
              <div><dt class="label">LEVEL</dt><dd>${level}</dd></div>
              <div><dt class="label">FOCUS</dt><dd>${c.focus}</dd></div>
              <div><dt class="label">ITEMS</dt><dd>${pad(c.projects.length)}</dd></div>
            </dl>
            <div class="pf-attr reveal" style="--d:7">
              <ul class="stats" aria-label="Chỉ số">${statsHTML(c)}</ul>
              ${radarHTML(c)}
            </div>
            <div class="links reveal" style="--d:8">
              <a class="btn btn-ghost" href="${c.github}" target="_blank" rel="noopener">${icon("github")} GITHUB</a>
              <a class="btn btn-ghost" href="mailto:${c.email}">${icon("mail")} EMAIL</a>
            </div>
          </div>
        </header>
        ${card}
        <section class="pf-sec io" aria-labelledby="tree-h">
          <div class="sec-head"><h2 id="tree-h">SKILL TREE</h2><span class="label">Rê chuột hoặc chạm để xem chi tiết</span></div>
          <div class="tree">${tree}</div>
        </section>

        <section class="pf-sec io" aria-labelledby="inv-h">
          <div class="sec-head"><h2 id="inv-h">INVENTORY</h2><span class="label">EQUIPMENT · ${c.projects.length} ITEMS</span></div>
          <div class="inv">${inv}</div>
        </section>

        <nav class="pf-nav" aria-label="Nhân vật khác">
          <a class="btn btn-ghost" href="#/c/${prev.id}">${icon("left")} ${prev.codename}</a>
          <a class="btn btn-primary" href="#/select">ALL CHARACTERS</a>
          <a class="btn btn-ghost" href="#/c/${next.id}">${next.codename} ${icon("right")}</a>
        </nav>
      </article>`;

    $(".inv", app).addEventListener("click", (e) => {
      const item = e.target.closest(".item");
      if (item) openProject(c, +item.dataset.p);
    });
    mount3D();
    playSwap($("#profile"));
    observeReveals();
    $("#hud-view").textContent = `PROFILE // ${c.codename}`;
  }

  /* ---------- scroll reveal ---------- */
  let io;
  function observeReveals() {
    io?.disconnect();
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    $$(".io", app).forEach((el) => io.observe(el));
  }

  /* ---------- dialogs ---------- */
  function openDialog(html) {
    dlg.innerHTML = `<button class="dlg-close" type="button" data-close aria-label="Đóng">${icon("x")}</button>${html}`;
    dlg.showModal();
    sfx.select();
  }
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
  });
  dlg.addEventListener("close", () => sfx.back());

  function openProject(c, k) {
    const p = c.projects[k];
    openDialog(`
      <div class="thumb pj-thumb">${p.image ? `<img src="${p.image}" alt="Ảnh dự án ${p.title}" width="1280" height="640">` : `<span class="rank" aria-hidden="true">${p.rank}</span>`}</div>
      <div class="pj-body">
        <p class="label">PROJECT ${pad(k + 1)} · RANK ${p.rank} · ${c.codename}</p>
        <h2 id="dlg-title">${p.title}</h2>
        <p class="muted">${p.desc}</p>
        <p class="label">TECH STACK</p>
        <ul class="chips">${p.stack.map((s) => `<li>${s}</li>`).join("")}</ul>
        <a class="btn btn-primary" href="${p.link}" target="_blank" rel="noopener">VIEW PROJECT ${icon("ext")}</a>
      </div>`);
  }

  function openOverride() {
    openDialog(`
      <div class="override">
        <p class="label">SYSTEM OVERRIDE</p>
        <div class="boot-bar"><span style="--p:1"></span></div>
        <h2 class="codename" id="dlg-title">ACCESS GRANTED</h2>
        <p>Bạn đã tìm ra easter egg. Cả đội cảm ơn vì đã khám phá tới tận đây!</p>
        <p class="label">CHEAT UNLOCKED: +99 RESPECT</p>
      </div>`);
  }

  function openHelp() {
    const rows = [
      ["← →", "Đổi nhân vật / sang hồ sơ kế bên"],
      ["ENTER", "Chọn nhân vật"],
      ["R", "Chọn ngẫu nhiên"],
      ["S", "Màn hình chọn nhân vật"],
      ["T", "Về trang nhóm"],
      ["ESC", "Quay lại"],
      ["?", "Bảng phím tắt này"],
    ];
    openDialog(`
      <div class="pj-body">
        <p class="label">CONTROLS</p>
        <h2 id="dlg-title">PHÍM TẮT</h2>
        <dl class="help">${rows.map(([k, v]) => `<dt><kbd>${k}</kbd></dt><dd class="muted">${v}</dd>`).join("")}</dl>
        <p class="label">PSST… ↑ ↑ ↓ ↓ ← → ← → B A</p>
      </div>`);
  }

  /* ---------- routing + wipe transition ---------- */
  // "#/" = team (landing), "#/select" = character select, "#/c/:id" = profile
  function parse() {
    const h = location.hash;
    const m = h.match(/^#\/c\/(\d+)$/);
    if (m) {
      const i = CHARACTERS.findIndex((c) => c.id === +m[1]);
      if (i >= 0) return { view: "profile", i };
    }
    if (h === "#/select") return { view: "select" };
    return { view: "team" }; // "#/", old "#/team" links and anything unknown
  }

  const wipe = $("#wipe");
  let firstRoute = true;
  let wipeTimer;
  function route() {
    if (dlg.open) dlg.close();
    const r = parse();
    const render = () => {
      if (r.view === "profile") renderProfile(r.i);
      else if (r.view === "select") renderSelect();
      else renderTeam();
      window.scrollTo(0, 0);
      $$(".hud-nav a").forEach((a) =>
        a.dataset.view === r.view ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
      if (!booting) app.querySelector("h1")?.focus({ preventScroll: true });
    };
    if (firstRoute || reduced) { firstRoute = false; render(); return; }

    wipe.querySelector("span").textContent =
      r.view === "profile" ? `LOADING CHARACTER ${pad(r.i + 1)} ...`
      : r.view === "team" ? `${TEAM.name} ...` : "CHARACTER SELECT ...";
    wipe.classList.remove("go");
    void wipe.offsetWidth;
    wipe.classList.add("go");
    sfx.whoosh();
    clearTimeout(wipeTimer);
    wipeTimer = setTimeout(render, 320);
  }
  window.addEventListener("hashchange", route);

  /* ---------- keyboard ---------- */
  const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  let kpos = 0;
  function konami(key) {
    const k = key.toLowerCase();
    kpos = k === KONAMI[kpos] ? kpos + 1 : k === KONAMI[0] ? 1 : 0;
    if (kpos === KONAMI.length) { kpos = 0; openOverride(); }
  }

  document.addEventListener("keydown", (e) => {
    if (booting || e.altKey || e.ctrlKey || e.metaKey) return;
    if (dlg.open) return; // native Esc closes the dialog
    konami(e.key);
    const { view } = parse();
    const k = e.key;
    const lk = k.toLowerCase();
    const onControl = e.target.closest?.("a, button, input, textarea, select");
    const step = k === "ArrowRight" ? 1 : k === "ArrowLeft" ? -1 : 0;

    if (k === "?") openHelp();
    else if (lk === "t" && view !== "team") location.hash = "#/";
    else if (lk === "s" && view !== "select") location.hash = "#/select";
    else if (view === "select") {
      if (step) { e.preventDefault(); switchTo(current + step); }
      else if (k === "Enter" && !onControl) { sfx.select(); location.hash = `#/c/${CHARACTERS[current].id}`; }
      else if (lk === "r") roll();
      else if (k === "Escape") { sfx.back(); location.hash = "#/"; }
    } else if (view === "profile") {
      if (k === "Escape") { sfx.back(); location.hash = "#/select"; }
      else if (step) location.hash = `#/c/${CHARACTERS[(current + step + total) % total].id}`;
    }
  });

  /* ---------- pointer: parallax vars, reticle, hover tick ---------- */
  if (finePointer && !reduced) {
    const reticle = $(".reticle");
    let raf = 0, px = 0, py = 0;
    window.addEventListener("pointermove", (e) => {
      px = e.clientX; py = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        root.style.setProperty("--mx", (px / innerWidth - 0.5).toFixed(3));
        root.style.setProperty("--my", (py / innerHeight - 0.5).toFixed(3));
        reticle.style.transform = `translate(${px}px, ${py}px)`;
        reticle.classList.add("on");
      });
    }, { passive: true });
    document.addEventListener("pointerleave", () => reticle.classList.remove("on"));

    let lastHot = null;
    document.addEventListener("pointerover", (e) => {
      const hot = e.target.closest?.("a, button");
      reticle.classList.toggle("hot", !!hot);
      if (hot && hot !== lastHot && hot.matches(".slot, .btn, .node, .item, .member, .nav-arrow, .press-start")) sfx.tick();
      lastHot = hot;
    });
  }

  /* ---------- intro: game title screen ---------- */
  async function runBoot() {
    const el = $("#boot");
    let seen = false;
    try { seen = sessionStorage.getItem("booted") === "1"; } catch {}
    if (seen) { el.remove(); booting = false; return; }

    // roster splash: one slanted panel per character
    $("#intro-cast").innerHTML = CHARACTERS.map((c, i) => `
      <div class="cast tinted" style="--accent:${c.color};--i:${i}">
        <span class="cast-art">${art(c, true)}</span>
        <span class="cast-name">${c.codename}</span>
        <span class="cast-class label">${c.className}</span>
      </div>`).join("");

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem("booted", "1"); } catch {}
      sfx.start();
      el.classList.add("done");
      booting = false;
      setTimeout(() => el.remove(), reduced ? 0 : 900);
      app.querySelector("h1")?.focus({ preventScroll: true });
    };

    $("#boot-skip").addEventListener("click", finish);
    $("#boot-start").addEventListener("click", finish);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || (e.key === "Enter" && !e.target.closest("button"))) finish();
    });
    $("#boot-skip").focus();

    const log = $("#boot-log");
    const fill = $("#boot-fill");
    const pct = $("#boot-pct");
    const lines = [
      ["> LOADING PLAYERS ......... [OK]", 30],
      ["> SYNCING SKILL TREES ..... [OK]", 65],
      ["> 4 / 4 CHARACTERS READY .. [OK]", 100],
    ];
    for (const [text, p] of lines) {
      if (finished) return;
      const line = document.createElement("span");
      log.append(line);
      if (reduced) line.textContent = text;
      else for (const ch of text) { line.textContent += ch; await wait(12); }
      line.innerHTML = line.textContent.replace("[OK]", '<span class="ok">[OK]</span>') + "\n";
      fill.style.setProperty("--p", p / 100);
      pct.textContent = p;
      await wait(reduced ? 0 : 160);
    }
    if (finished) return;
    el.classList.add("ready");
    const start = $("#boot-start");
    start.hidden = false;
    start.focus();
  }

  renderSound();
  applyTheme();
  route();
  runBoot();
})();
