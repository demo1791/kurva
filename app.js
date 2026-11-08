import * as THREE from "three";

/* ============ 内容数据（单一来源） ============ */
const MODULES = [
  {
    id: "study",
    name: "学习经历",
    en: "STUDY",
    icon: "ph:graduation-cap-fill",
    img: "https://images.pexels.com/photos/38368230/pexels-photo-38368230.jpeg?auto=compress&cs=tinysrgb&w=1600",
    coord: { lat: 49.95, lon: 15.2666667 },
    intro: "在学数字经济，还在路上",
    body: ["本科在读，方向数字经济", "必修靠肝，选修靠兴趣", "最怕的不是考试，是小组作业"],
  },
  {
    id: "gpa",
    name: "成绩",
    en: "GPA",
    icon: "ph:chart-line-fill",
    img: "https://images.pexels.com/photos/37134395/pexels-photo-37134395.jpeg?auto=compress&cs=tinysrgb&w=1600",
    coord: { lat: 48.8566667, lon: 2.3522222 },
    intro: "绩点 5.1，比满多一点",
    body: ["GPA 5.1，含金量自己品", "满分 5.0，我拿 5.1", "凌晨三点的图书馆见过我"],
  },
  {
    id: "work",
    name: "成果展示",
    en: "WORK",
    icon: "ph:timer-fill",
    img: "images/hollywood.png",
    coord: { lat: 34.0522222, lon: -118.2436111 },
    intro: "番茄钟，先专注 25 分钟",
    body: [],
  },
  {
    id: "skills",
    name: "能力介绍",
    en: "SKILLS",
    icon: "ph:code-fill",
    img: "images/chongqing-bridge.jpg",
    coord: { lat: 29.55, lon: 106.5069444 },
    intro: "会写码，更会聊着写码",
    body: ["C、Python、Java 都摸过", "主打 vibecoding", "AI 是我的结对搭子"],
  },
  {
    id: "hobby",
    name: "爱好",
    en: "HOBBY",
    icon: "ph:game-controller-fill",
    img: "https://images.pexels.com/photos/37804211/pexels-photo-37804211.jpeg?auto=compress&cs=tinysrgb&w=1600",
    coord: { lat: 41.01, lon: 28.9602778 },
    intro: "游戏和音乐，各占一半",
    body: ["游戏：上分和下饭二选一", "音乐：耳机一戴世界静音", "两者皆可熬夜"],
  },
];

/* ============ 工具 ============ */
const $ = (id) => document.getElementById(id);

function latLonToVec3(lat, lon, r = 1) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function toDMS(value, pos, neg) {
  const hemi = value >= 0 ? pos : neg;
  const d = Math.abs(value);
  let deg = Math.floor(d);
  let min = Math.floor((d - deg) * 60);
  let sec = Math.round(((d - deg) * 60 - min) * 60);
  if (sec === 60) { sec = 0; min += 1; }
  if (min === 60) { min = 0; deg += 1; }
  const pad = (n) => String(n).padStart(2, "0");
  return `${deg}°${pad(min)}′${pad(sec)}″${hemi}`;
}

function coordLabel(c) {
  return `${toDMS(c.lat, "N", "S")} · ${toDMS(c.lon, "E", "W")}`;
}

function targetYaw(p) {
  return Math.atan2(-p.x, p.z);
}

/* ============ 地球仪 ============ */
const canvas = $("globe");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 20);
camera.position.set(0, 0, 3.4);

const globe = new THREE.Group();
scene.add(globe);

/* 点阵星图纹理 */
function makeGlobeTexture() {
  const w = 1024, h = 512;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgba(22,16,11,0.9)";
  ctx.fillRect(0, 0, w, h);

  // 经纬网格点（地图感）
  ctx.fillStyle = "#e9a54b";
  for (let lat = -75; lat <= 75; lat += 15) {
    for (let lon = -180; lon < 180; lon += 15) {
      const x = ((lon + 180) / 360) * w;
      const y = ((90 - lat) / 180) * h;
      ctx.globalAlpha = 0.16;
      ctx.beginPath();
      ctx.arc(x, y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // 随机星点（球面均匀采样）
  const n = 2600;
  for (let i = 0; i < n; i++) {
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const lon = (theta * 180) / Math.PI - 180;
    const lat = 90 - (phi * 180) / Math.PI;
    const x = ((lon + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    const r = Math.random() * 1.6 + 0.3;
    ctx.globalAlpha = Math.random() * 0.5 + 0.1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // 少量亮星点缀
  ctx.fillStyle = "#f0e6d2";
  for (let i = 0; i < 40; i++) {
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const lon = (theta * 180) / Math.PI - 180;
    const lat = 90 - (phi * 180) / Math.PI;
    const x = ((lon + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const sphereMat = new THREE.MeshBasicMaterial({
  map: makeGlobeTexture(),
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
  alphaTest: 0.01,
});
const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 72, 48), sphereMat);
globe.add(sphere);

/* 经纬笼架（让球体有体积感） */
const cageMat = new THREE.MeshBasicMaterial({
  color: 0xe9a54b,
  wireframe: true,
  transparent: true,
  opacity: 0.14,
  depthWrite: false,
});
const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.16, 2), cageMat);
globe.add(cage);

/* 背景暖光晕 */
const halo = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const g = c.getContext("2d").createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, "rgba(233,165,75,0.55)");
      g.addColorStop(0.5, "rgba(233,165,75,0.12)");
      g.addColorStop(1, "rgba(233,165,75,0)");
      const ctx = c.getContext("2d");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
);
halo.scale.setScalar(4);
globe.add(halo);

/* 标记点（发光球 + 光晕精灵） */
function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.35, "rgba(233,165,75,0.5)");
  g.addColorStop(1, "rgba(233,165,75,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const glowTex = makeGlowTexture();

const markers = MODULES.map((m) => {
  const group = new THREE.Group();
  const pos = latLonToVec3(m.coord.lat, m.coord.lon, 1.01);
  group.position.copy(pos);

  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xe9a54b })
  );
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.9,
    })
  );
  glow.scale.setScalar(0.34);

  group.add(dot, glow);
  globe.add(group);

  return { ...m, group, dot, glow };
});

/* ============ 交互状态 ============ */
let mode = "idle"; // idle | drag | fly | hold
let selected = null;
let hovered = null;
let drag = { active: false, x: 0, y: 0, moved: false };
let fly = { ry: 0, rx: 0, fromRy: 0, fromRx: 0, t: 0 };
let holdTimer = null;
let prevTime = performance.now();
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============ 布局 ============ */
function layout() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  if (w <= 720) {
    globe.position.set(0, 0.85, 0);
    camera.position.set(0, 0.1, 4.5);
  } else {
    globe.position.set(1.55, 0.75, 0);
    camera.position.set(0, 0, 4.8);
  }
  camera.lookAt(0, 0, 0);
}
window.addEventListener("resize", layout);
layout();

/* ============ 指针交互 ============ */
function ndc(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
    y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
  };
}

const tmp = new THREE.Vector3();
function pickMarker(e) {
  const p = ndc(e);
  let best = null;
  let bestDist = Infinity;
  for (const m of markers) {
    m.group.getWorldPosition(tmp);
    if (tmp.z < 0.1) continue; // 只选正面
    tmp.project(camera);
    if (tmp.z > 1) continue;
    const d = Math.hypot(p.x - tmp.x, p.y - tmp.y);
    if (d < bestDist) {
      bestDist = d;
      best = m;
    }
  }
  return bestDist < 0.09 ? best : null;
}

canvas.addEventListener("pointerdown", (e) => {
  drag.active = true;
  drag.moved = false;
  drag.x = e.clientX;
  drag.y = e.clientY;
  mode = "drag";
  canvas.classList.add("is-dragging");
  canvas.setPointerCapture(e.pointerId);
  clearHoldTimer();
});

canvas.addEventListener("pointermove", (e) => {
  if (drag.active) {
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    globe.rotation.y += dx * 0.005;
    globe.rotation.x += dy * 0.005;
    globe.rotation.x = Math.max(-1.2, Math.min(1.2, globe.rotation.x));
  } else {
    const m = pickMarker(e);
    setHover(m);
  }
});

canvas.addEventListener("pointerup", (e) => {
  drag.active = false;
  canvas.classList.remove("is-dragging");
  if (!drag.moved) {
    const m = pickMarker(e);
    if (m) select(m);
  }
  mode = selected ? "hold" : "idle";
  armHoldTimer();
});

canvas.addEventListener("pointerleave", () => setHover(null));

/* ============ 图例导航 ============ */
const legend = $("legend");
markers.forEach((m, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.dataset.id = m.id;
  b.innerHTML = `<span class="num">${String(i + 1).padStart(2, "0")}</span>${m.name}`;
  b.addEventListener("click", () => select(m));
  legend.appendChild(b);
  m._btn = b;
});

/* ============ 内容面板 ============ */
function select(m) {
  selected = m;
  updatePanel(m);
  updateLegend(m);
  updateReadout(m);
  updateBackdrop(m);

  const p = latLonToVec3(m.coord.lat, m.coord.lon, 1);
  fly.fromRy = globe.rotation.y;
  fly.fromRx = globe.rotation.x;
  fly.ry = targetYaw(p);
  fly.rx = 0;
  fly.t = 0;
  mode = "fly";
  clearHoldTimer();
}

function updatePanel(m) {
  $("panelCoord").textContent = coordLabel(m.coord);
  $("panelIcon").innerHTML = `<iconify-icon icon="${m.icon}"></iconify-icon>`;
  $("panelEn").textContent = m.en;
  $("panelName").textContent = m.name;
  $("panelIntro").textContent = m.intro;
  $("panelBody").innerHTML = m.body.map((t) => `<li>${t}</li>`).join("");
  const isWork = m.id === "work";
  $("panelBody").style.display = isWork ? "none" : "";
  $("pomodoro").hidden = !isWork;
  const panel = $("panel");
  panel.classList.remove("is-entering");
  void panel.offsetWidth;
  panel.classList.add("is-entering");
}

function updateLegend(m) {
  markers.forEach((x) => x._btn.classList.toggle("is-active", x === m));
}

function updateReadout(m) {
  $("readout").textContent = m ? coordLabel(m.coord) : "SELECT A REGION";
}

/* ============ 背景图（对应地点照片，交叉淡入） ============ */
const backdrops = [$("backdropA"), $("backdropB")];
let bdIndex = 0;

function updateBackdrop(m) {
  const next = backdrops[bdIndex];
  const cur = backdrops[1 - bdIndex];
  next.style.backgroundImage = `url("${m.img}")`;
  next.classList.add("is-on");
  cur.classList.remove("is-on");
  bdIndex = 1 - bdIndex;
}

// 预加载，避免切换时闪空白
markers.forEach((m) => {
  const im = new Image();
  im.src = m.img;
});

/* ============ 番茄钟 ============ */
const POMO_DUR = { focus: 25 * 60, break: 5 * 60 };
const POMO_CIRC = 2 * Math.PI * 52;
const pomo = { mode: "focus", running: false, remaining: POMO_DUR.focus, endAt: 0 };

const pomoEl = $("pomodoro");
const pomoTime = $("pomoTime");
const pomoMode = $("pomoMode");
const pomoProgress = $("pomoProgress");
const pomoToggle = $("pomoToggle");
const pomoReset = $("pomoReset");

function fmtPomo(s) {
  s = Math.max(0, Math.round(s));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function renderPomo() {
  const dur = POMO_DUR[pomo.mode];
  const r = pomo.running ? Math.max(0, (pomo.endAt - Date.now()) / 1000) : pomo.remaining;
  pomoTime.textContent = fmtPomo(r);
  pomoMode.textContent = pomo.mode === "focus" ? "专注" : "休息";
  pomoProgress.style.strokeDashoffset = (POMO_CIRC * (1 - r / dur)).toFixed(1);
  pomoEl.classList.toggle("is-break", pomo.mode === "break");
  pomoToggle.textContent = pomo.running ? "暂停" : "开始";
}

function pomoTick() {
  if (!pomo.running) return;
  if (pomo.endAt - Date.now() <= 0) {
    pomo.mode = pomo.mode === "focus" ? "break" : "focus";
    pomo.remaining = POMO_DUR[pomo.mode];
    pomo.endAt = Date.now() + pomo.remaining * 1000;
  }
  renderPomo();
}

pomoToggle.addEventListener("click", () => {
  if (pomo.running) {
    pomo.remaining = Math.max(0, (pomo.endAt - Date.now()) / 1000);
    pomo.running = false;
  } else {
    pomo.running = true;
    pomo.endAt = Date.now() + pomo.remaining * 1000;
  }
  renderPomo();
});

pomoReset.addEventListener("click", () => {
  pomo.running = false;
  pomo.mode = "focus";
  pomo.remaining = POMO_DUR.focus;
  renderPomo();
});

setInterval(pomoTick, 250);
renderPomo();

function setHover(m) {
  if (hovered === m) return;
  hovered = m;
  canvas.classList.toggle("is-hovering", !!m);
  markers.forEach((x) => {
    const on = x === m;
    x.dot.material.color.setHex(on ? 0xe2563b : 0xe9a54b);
    x.glow.scale.setScalar(on ? 0.5 : 0.34);
  });
  if (m && mode !== "fly") updateReadout(m);
  else if (!m) updateReadout(selected);
}

function clearHoldTimer() {
  if (holdTimer) clearTimeout(holdTimer);
  holdTimer = null;
}
function armHoldTimer() {
  clearHoldTimer();
  holdTimer = setTimeout(() => {
    if (!drag.active) mode = "idle";
  }, 12000);
}

/* ============ 动画 ============ */
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

function animate(now) {
  const dt = Math.min((now - prevTime) / 1000, 0.05);
  prevTime = now;

  if (mode === "idle" && !reducedMotion) {
    globe.rotation.y += dt * 0.06;
  } else if (mode === "fly") {
    fly.t += dt / 1.1;
    const k = easeOutExpo(Math.min(fly.t, 1));
    globe.rotation.y = fly.fromRy + (fly.ry - fly.fromRy) * k;
    globe.rotation.x = fly.fromRx + (fly.rx - fly.fromRx) * k;
    if (fly.t >= 1) {
      mode = "hold";
      armHoldTimer();
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

/* ============ 启动 ============ */
// 初始默认选中「学习经历」，并让它正面朝向镜头
const first = markers[0];
const p0 = latLonToVec3(first.coord.lat, first.coord.lon, 1);
globe.rotation.y = targetYaw(p0);
select(first);
mode = "hold";
armHoldTimer();

requestAnimationFrame(animate);
