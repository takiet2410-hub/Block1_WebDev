/* 3D chibi avatars, built from Three.js primitives (no model files to load).
   One shared WebGL renderer: live + draggable on the current stage, still snapshots for thumbnails.
   No WebGL or CDN down → window.Avatar3D stays undefined and app.js falls back to the SVG hologram. */
(() => {
  "use strict";
  if (!window.THREE) return;
  const T = THREE;
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return;
  }
  const W = 400, H = 520;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  renderer.setPixelRatio(dpr);
  renderer.setSize(W, H, false);
  const canvas = renderer.domElement;
  canvas.className = "av3d-canvas";
  canvas.setAttribute("role", "img");

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, W / H, 0.1, 50);
  camera.position.set(0, 1.25, 5.6);
  camera.lookAt(0, 1.2, 0);

  scene.add(new T.HemisphereLight(0xffffff, 0x2a2a40, 0.75));
  const key = new T.DirectionalLight(0xffffff, 0.95);
  key.position.set(2.5, 3.5, 5);
  const rim = new T.DirectionalLight(0xffffff, 1.6);
  rim.position.set(-3, 2.5, -4);
  const under = new T.PointLight(0xffffff, 0.6, 6);
  under.position.set(0, -0.6, 2.5);
  scene.add(key, rim, under);

  const SKIN = ["#F0C7A4", "#E8B793", "#F3CDB0", "#DDAA84"];
  const HAIR = ["#14141C", "#1E1630", "#5B2340", "#2B1B12"];
  const std = (color, roughness = 0.6, metalness = 0, extra = {}) =>
    new T.MeshStandardMaterial({ color, roughness, metalness, ...extra });

  function add(parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) {
    const m = new T.Mesh(geo, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.scale.set(...scale);
    parent.add(m);
    return m;
  }

  /* ---------- model ---------- */
  function build(c) {
    const i = (c.id - 1) % 4;
    const accent = new T.Color(c.color);
    const M = {
      skin: std(SKIN[i], 0.7),
      suit: std(0x1b1d30, 0.5, 0.3),
      suit2: std(accent.clone().multiplyScalar(0.35), 0.55, 0.2),
      cloth: std(accent, 0.65),
      trim: std(accent, 0.35, 0.2, { emissive: accent, emissiveIntensity: 0.6 }),
      dark: std(0x101119, 0.35, 0.3),
      white: new T.MeshBasicMaterial({ color: 0xffffff }),
      blush: new T.MeshBasicMaterial({ color: 0xff8fa3, transparent: true, opacity: 0.35 }),
      hair: std(HAIR[i], 0.55),
      glass: std(accent, 0.1, 0, { emissive: accent, emissiveIntensity: 0.8, transparent: true, opacity: 0.45, side: T.DoubleSide }),
    };
    const root = new T.Group();
    const body = new T.Group();
    const head = new T.Group();
    head.position.y = 1.78;
    root.add(body, head);
    const spin = [];

    // torso, collar, neck, shoulder pads, class emblem
    add(body, new T.CapsuleGeometry(0.78, 0.9, 8, 24), M.suit, [0, -0.15, 0], [0, 0, 0], [1.25, 1, 0.72]);
    add(body, new T.TorusGeometry(0.3, 0.08, 12, 32), M.trim, [0, 1.0, 0], [Math.PI / 2, 0, 0]);
    add(body, new T.CylinderGeometry(0.2, 0.22, 0.32, 20), M.skin, [0, 1.12, 0]);
    for (const s of [-1, 1]) add(body, new T.SphereGeometry(0.34, 24, 16), M.suit2, [s * 0.82, 0.72, 0], [0, 0, 0], [1, 0.7, 1]);
    const EMBLEM = [
      new T.TorusGeometry(0.13, 0.035, 10, 32),
      new T.CylinderGeometry(0.16, 0.16, 0.05, 4),
      new T.CylinderGeometry(0.18, 0.18, 0.05, 3),
      new T.CylinderGeometry(0.15, 0.15, 0.05, 6),
    ];
    add(body, EMBLEM[i], M.trim, [0, -0.05, 0.58], [i ? -Math.PI / 2 : 0, 0, 0]);

    // face
    add(head, new T.SphereGeometry(0.62, 48, 32), M.skin, [0, 0, 0], [0, 0, 0], [1, 0.96, 0.95]);
    for (const s of [-1, 1]) {
      add(head, new T.CapsuleGeometry(0.05, 0.08, 6, 12), M.dark, [s * 0.2, -0.02, 0.55]);
      add(head, new T.SphereGeometry(0.02, 8, 8), M.white, [s * 0.2 + 0.02, 0.03, 0.6]);
      add(head, new T.SphereGeometry(0.07, 12, 8), M.blush, [s * 0.32, -0.15, 0.49], [0, 0, 0], [1, 0.6, 0.3]);
    }
    add(head, new T.TorusGeometry(0.06, 0.014, 8, 16, Math.PI), M.dark, [0, -0.2, 0.56], [0, 0, Math.PI]);
    // hair cap, tilted back so the forehead shows
    add(head, new T.SphereGeometry(0.655, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.55), M.hair, [0, 0.02, 0], [-0.35, 0, 0], [1.02, 1, 1]);

    const up = new T.Vector3(0, 1, 0);
    const outward = (mesh, dir) => mesh.quaternion.setFromUnitVectors(up, dir.normalize());

    if (i === 0) {
      // ALEX — spiky fringe, round glasses, headphones
      for (let k = -2; k <= 2; k++) {
        const phi = k * 0.38, th = 0.72;
        const dir = new T.Vector3(Math.sin(phi) * Math.sin(th), Math.cos(th), Math.cos(phi) * Math.sin(th));
        const cone = add(head, new T.ConeGeometry(0.13, 0.32, 12), M.hair, dir.clone().multiplyScalar(0.6).toArray());
        outward(cone, dir.add(new T.Vector3(0, 0, 0.6)));
      }
      for (const s of [-1, 1]) {
        add(head, new T.TorusGeometry(0.13, 0.022, 8, 28), M.dark, [s * 0.2, -0.02, 0.6]);
        add(head, new T.CircleGeometry(0.12, 24), M.glass, [s * 0.2, -0.02, 0.6]);
        add(head, new T.CylinderGeometry(0.17, 0.17, 0.12, 24), M.trim, [s * 0.66, -0.02, 0], [0, 0, Math.PI / 2]);
        add(head, new T.CylinderGeometry(0.2, 0.2, 0.06, 24), M.dark, [s * 0.74, -0.02, 0], [0, 0, Math.PI / 2]);
      }
      add(head, new T.CylinderGeometry(0.012, 0.012, 0.14, 6), M.dark, [0, 0, 0.62], [0, 0, Math.PI / 2]);
      add(head, new T.TorusGeometry(0.72, 0.05, 12, 40, Math.PI), M.dark);
    } else if (i === 1) {
      // NOVA — hood with open face, glowing visor, antenna, gear rings
      add(head, new T.SphereGeometry(0.8, 48, 32, Math.PI / 2 + 1, Math.PI * 2 - 2, 0, Math.PI * 0.78), std(accent.clone().multiplyScalar(0.3), 0.7, 0, { side: T.DoubleSide }), [0, 0.04, -0.06]);
      add(head, new T.CylinderGeometry(0.645, 0.645, 0.2, 40, 1, true, -1, 2), M.glass, [0, 0, 0]);
      add(head, new T.CylinderGeometry(0.015, 0.015, 0.5, 6), M.dark, [0.42, 0.85, -0.2], [0, 0, -0.35]);
      add(head, new T.SphereGeometry(0.05, 12, 8), M.trim, [0.51, 1.09, -0.2]);
      const gear = new T.Group();
      gear.position.set(0, 0, -0.45);
      add(gear, new T.TorusGeometry(1.0, 0.02, 8, 80), M.trim);
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        add(gear, new T.BoxGeometry(0.08, 0.08, 0.04), M.trim, [Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0], [0, 0, a]);
      }
      head.add(gear);
      spin.push([gear, "z", 0.25]);
    } else if (i === 2) {
      // IRIS — long hair, side locks, beret, orbiting ring + sparks
      add(head, new T.CapsuleGeometry(0.5, 0.7, 8, 20), M.hair, [0, -0.55, -0.28], [0.12, 0, 0], [1.25, 1, 0.6]);
      for (const s of [-1, 1]) add(head, new T.CapsuleGeometry(0.13, 0.5, 6, 12), M.hair, [s * 0.55, -0.32, 0.12], [0, 0, s * 0.1]);
      const beret = new T.Group();
      beret.position.set(0.1, 0.52, -0.02);
      beret.rotation.set(-0.15, 0, -0.32);
      add(beret, new T.CylinderGeometry(0.48, 0.54, 0.16, 32), M.cloth);
      add(beret, new T.SphereGeometry(0.06, 12, 8), M.cloth, [0, 0.1, 0]);
      head.add(beret);
      const orbit = new T.Group();
      orbit.rotation.x = 0.35;
      add(orbit, new T.TorusGeometry(0.98, 0.018, 8, 80), M.trim, [0, 0, 0], [Math.PI / 2, 0, 0]);
      for (const a of [0, Math.PI]) add(orbit, new T.OctahedronGeometry(0.08), M.trim, [Math.cos(a) * 0.98, 0, Math.sin(a) * 0.98]);
      head.add(orbit);
      spin.push([orbit, "y", 0.6]);
    } else {
      // ECHO — HUD monocle, earpiece, orbiting data cubes
      add(head, new T.TorusGeometry(0.16, 0.025, 8, 28), M.trim, [0.2, -0.02, 0.6]);
      add(head, new T.CircleGeometry(0.15, 24), M.glass, [0.2, -0.02, 0.6]);
      add(head, new T.CylinderGeometry(0.16, 0.16, 0.1, 20), M.trim, [-0.66, -0.02, 0], [0, 0, Math.PI / 2]);
      add(head, new T.CylinderGeometry(0.012, 0.012, 0.45, 6), M.dark, [-0.52, -0.25, 0.3], [0.9, 0.5, 0]);
      const data = new T.Group();
      data.position.y = 0.6;
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        add(data, new T.BoxGeometry(0.13, 0.13, 0.13), M.trim, [Math.cos(a) * 1.3, Math.sin(k * 1.7) * 0.35, Math.sin(a) * 1.3], [k, k * 0.5, 0]);
      }
      root.add(data);
      spin.push([data, "y", 0.45]);
    }
    return { root, body, head, spin, color: c.color, name: c.name };
  }

  const models = new Map();
  const model = (c) => {
    if (!models.has(c.id)) models.set(c.id, build(c));
    return models.get(c.id);
  };
  let shown = null;
  function show(m) {
    if (shown !== m) {
      if (shown) scene.remove(shown.root);
      scene.add(m.root);
      shown = m;
    }
    rim.color.set(m.color);
    under.color.set(m.color);
  }

  /* ---------- live stage ---------- */
  let live = null, raf = 0, last = 0, t = 0;
  let dragYaw = 0, vel = 0, drag = null;
  const look = { x: 0, y: 0 };

  function loop(now) {
    if (!canvas.isConnected || !live) { raf = 0; return; }
    raf = requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;
    if (!drag) { dragYaw += vel; vel *= 0.92; dragYaw *= 0.97; }
    const sway = reduced ? 0 : Math.sin(t * 0.6) * 0.18;
    const target = look.x * 0.7 + sway + dragYaw;
    live.root.rotation.y += (target - live.root.rotation.y) * 0.08;
    live.head.rotation.x += (look.y * 0.3 - live.head.rotation.x) * 0.08;
    live.head.rotation.z = reduced ? 0 : Math.sin(t * 0.8) * 0.04;
    live.body.scale.y = 1 + (reduced ? 0 : Math.sin(t * 1.6) * 0.008);
    if (!reduced) for (const [obj, axis, speed] of live.spin) obj.rotation[axis] += speed * dt;
    show(live);
    renderer.render(scene, camera);
  }

  addEventListener("pointermove", (e) => {
    look.x = e.clientX / innerWidth - 0.5;
    look.y = e.clientY / innerHeight - 0.5;
  }, { passive: true });
  canvas.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    vel = (e.clientX - drag.x) * 0.012;
    dragYaw += vel;
    drag.x = e.clientX;
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  /* ---------- thumbnails: one render each, cached as data URLs ---------- */
  const thumbs = new Map();
  function thumb(c) {
    if (thumbs.has(c.id)) return thumbs.get(c.id);
    const m = model(c);
    const saved = [m.root.rotation.y, m.head.rotation.x, m.head.rotation.z];
    m.root.rotation.y = -0.35;
    m.head.rotation.set(0, 0, 0);
    show(m);
    renderer.setPixelRatio(1);
    renderer.render(scene, camera);
    let url = "";
    try { url = canvas.toDataURL("image/png"); } catch {}
    renderer.setPixelRatio(dpr);
    [m.root.rotation.y, m.head.rotation.x, m.head.rotation.z] = saved;
    if (live) { show(live); renderer.render(scene, camera); }
    thumbs.set(c.id, url);
    return url;
  }

  window.Avatar3D = {
    thumb,
    mount(host, c) {
      const m = model(c);
      if (live !== m) { dragYaw = 0; vel = 0; }
      live = m;
      canvas.setAttribute("aria-label", `Nhân vật 3D của ${c.name}. Kéo để xoay.`);
      host.append(canvas);
      show(m);
      renderer.render(scene, camera);
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    },
  };
})();
