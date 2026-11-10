import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  PX_TO_M,
  HALL,
  BLOCKS,
  STAIRS,
  CANTEEN,
  GARDEN,
  PILLARS,
  ENTRANCES,
  BOOTHS,
} from './layout.js';
import bannerFrontUrl from './assets/banner-front.webp';
import bannerLeftUrl from './assets/banner-left.webp';
import bannerRightUrl from './assets/banner-right.webp';
import bannerTopUrl from './assets/banner-top.webp';

const W = 1920;
const H = 1080;
const CEILING = 3.4;
const PLINTH = 0.6; // lantai GKM lebih tinggi dari halaman, sesuai tangga di pintu depan

const CX = (HALL[0] + HALL[2]) / 2;
const CZ = (HALL[1] + HALL[3]) / 2;
const mx = (px) => (px - CX) * PX_TO_M;
const mz = (py) => (py - CZ) * PX_TO_M;
const box = ([x0, y0, x1, y1]) => ({
  x: mx((x0 + x1) / 2),
  z: mz((y0 + y1) / 2),
  w: (x1 - x0) * PX_TO_M,
  d: (y1 - y0) * PX_TO_M,
});

export function createVenue(container) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Renderer ----------
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    // Kedalaman logaritmik: lembar banner dan stiker lantai yang tipis tidak lagi berkedip dari jauh.
    logarithmicDepthBuffer: true,
  });
  renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.78;
  container.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(W, H);
  labelRenderer.domElement.className = 'v-labels';
  container.appendChild(labelRenderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0b0c);
  scene.fog = new THREE.Fog(0x0b0b0c, 34, 80);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.3;

  const camera = new THREE.PerspectiveCamera(42, W / H, 0.2, 160);

  // ---------- Cahaya ----------
  scene.add(new THREE.HemisphereLight(0xffffff, 0x77777c, 0.5));
  const sun = new THREE.DirectionalLight(0xfff1d4, 1.25);
  sun.position.set(9, 18, 11);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 50 });
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  // ---------- Material ----------
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...extra });
  const M = {
    floor: mat(0xdcdcd8, { roughness: 0.2 }),
    white: mat(0xf4f4f2, { roughness: 0.55 }),
    panel: mat(0xc9cdd1, { roughness: 0.6 }),
    wall: mat(0xe6e8ea, { roughness: 0.8 }),
    ground: mat(0x161617, { roughness: 1 }),
    paving: mat(0x3a3a3d, { roughness: 0.95 }),
    canteen: mat(0x29292c, { roughness: 0.9 }),
    step: mat(0x9a9da1, { roughness: 0.85 }),
    grass: mat(0x3f9a35, { roughness: 1 }),
    leaf: mat(0x2d7a2b, { roughness: 0.9 }),
    blue: mat(0x1848c8, { roughness: 0.9 }),
    chairBlue: mat(0x1f55c4, { roughness: 0.6 }),
    cream: mat(0xe9dfc0, { roughness: 0.6 }),
    black: mat(0x101011, { roughness: 0.5 }),
    gold: mat(0xffc61a, { roughness: 0.4, emissive: 0xffc61a, emissiveIntensity: 0.35 }),
    pipe: mat(0xd42c22, { roughness: 0.4 }),
    lamp: mat(0xffffff, { emissive: 0xfff3d0, emissiveIntensity: 1.6 }),
  };

  const add = (geo, material, x, y, z, { shadow = true, receive = true, parent = scene } = {}) => {
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = shadow;
    mesh.receiveShadow = receive;
    parent.add(mesh);
    return mesh;
  };
  const cube = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  // ---------- Tanah, lantai, kantin ----------
  const hall = box(HALL);
  add(new THREE.CircleGeometry(70, 64).rotateX(-Math.PI / 2), M.ground, 0, -PLINTH, 0, { shadow: false });
  add(cube(hall.w, PLINTH, hall.d), M.floor, hall.x, -PLINTH / 2, hall.z, { shadow: false });

  const canteen = box(CANTEEN);
  add(cube(canteen.w, PLINTH, canteen.d), M.canteen, canteen.x, -PLINTH / 2, canteen.z, { shadow: false });
  // Selasar antara aula dan kantin.
  const gapD = (HALL[1] - CANTEEN[3]) * PX_TO_M;
  add(cube(hall.w, PLINTH, gapD), M.canteen, hall.x, -PLINTH / 2, mz((HALL[1] + CANTEEN[3]) / 2), { shadow: false });

  // ---------- Ruang di sisi belakang ----------
  BLOCKS.forEach(({ rect }) => {
    const b = box(rect);
    add(cube(b.w, CEILING, b.d), M.panel, b.x, CEILING / 2, b.z);
  });

  // Tangga: anak tangga naik dari kiri ke kanan.
  const st = box(STAIRS);
  const STEPS = 14;
  for (let i = 0; i < STEPS; i++) {
    const h = ((i + 1) / STEPS) * CEILING;
    const w = st.w / STEPS;
    add(cube(w, h, st.d), M.white, st.x - st.w / 2 + w * (i + 0.5), h / 2, st.z);
  }

  // ---------- Dinding keliling (hanya terlihat dari dalam, jadi tidak menutupi pandangan) ----------
  const wallMat = M.wall.clone();
  wallMat.side = THREE.FrontSide;
  const wall = (side, fromPx, toPx) => {
    const len = (toPx - fromPx) * PX_TO_M;
    if (len <= 0) return;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(len, CEILING), wallMat);
    const mid = (fromPx + toPx) / 2;
    if (side === 'west') mesh.position.set(mx(HALL[0]), CEILING / 2, mz(mid)), (mesh.rotation.y = Math.PI / 2);
    if (side === 'east') mesh.position.set(mx(HALL[2]), CEILING / 2, mz(mid)), (mesh.rotation.y = -Math.PI / 2);
    if (side === 'north') mesh.position.set(mx(mid), CEILING / 2, mz(HALL[1]));
    if (side === 'south') mesh.position.set(mx(mid), CEILING / 2, mz(HALL[3])), (mesh.rotation.y = Math.PI);
    mesh.receiveShadow = true;
    scene.add(mesh);
  };
  const segments = (side, start, end) => {
    let cursor = start;
    ENTRANCES.filter((e) => e.side === side)
      .sort((a, b) => a.from - b.from)
      .forEach((e) => {
        wall(side, cursor, e.from);
        cursor = e.to;
      });
    wall(side, cursor, end);
  };
  segments('west', 629, HALL[3]);
  segments('east', 552, HALL[3]);
  segments('south', HALL[0], HALL[2]);
  wall('north', 555, 1260);

  // Plafon dengan void di atas taman. Hanya terlihat dari bawah, jadi tampak atas tetap terbuka.
  const ceilingShape = new THREE.Shape()
    .moveTo(mx(HALL[0]), mz(HALL[1]))
    .lineTo(mx(HALL[2]), mz(HALL[1]))
    .lineTo(mx(HALL[2]), mz(HALL[3]))
    .lineTo(mx(HALL[0]), mz(HALL[3]))
    .closePath();
  ceilingShape.holes.push(
    new THREE.Path()
      .moveTo(mx(GARDEN[0]), mz(GARDEN[1]))
      .lineTo(mx(GARDEN[0]), mz(GARDEN[3]))
      .lineTo(mx(GARDEN[2]), mz(GARDEN[3]))
      .lineTo(mx(GARDEN[2]), mz(GARDEN[1]))
      .closePath(),
  );
  const ceiling = new THREE.Mesh(
    new THREE.ShapeGeometry(ceilingShape).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xd9d9d6, side: THREE.FrontSide }),
  );
  ceiling.position.y = CEILING;
  scene.add(ceiling);

  // ---------- Pintu masuk ----------
  const labels = [];
  const label = (text, x, y, z, minor = false) => {
    const el = document.createElement('div');
    el.className = `v-label${minor ? ' minor' : ''}`;
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(x, y, z);
    scene.add(obj);
    labels.push(obj);
  };

  ENTRANCES.forEach((e) => {
    const len = (e.to - e.from) * PX_TO_M;
    const mid = (e.from + e.to) / 2;
    if (e.side === 'south') {
      const z = mz(HALL[3]);
      add(cube(len, 0.02, 0.9), M.blue, mx(mid), 0.011, z - 0.5, { shadow: false });
      for (let i = 0; i < 3; i++) {
        const h = PLINTH - (i + 1) * 0.15;
        add(cube(len + 0.6, h, 0.36), M.step, mx(mid), -PLINTH + h / 2, z + 0.18 + i * 0.36, { shadow: false });
      }
      add(cube(len + 4, 0.02, 4), M.paving, mx(mid), -PLINTH + 0.011, z + 3.1, { shadow: false });
      label(e.name, mx(mid), 0.9, z + 0.9);
    } else {
      const x = mx(e.side === 'west' ? HALL[0] : HALL[2]);
      const inset = e.side === 'west' ? 0.18 : -0.18;
      add(cube(0.3, 0.02, len), M.gold, x + inset, 0.011, mz(mid), { shadow: false });
      label(e.name, x, 1.4, mz(mid), true);
    }
  });

  // ---------- Pilar, pipa merah, lampu ----------
  PILLARS.forEach((rect) => {
    const p = box(rect);
    add(cube(p.w, CEILING, p.d), M.white, p.x, CEILING / 2, p.z);
  });
  const pipeGeo = new THREE.CylinderGeometry(0.04, 0.04, hall.w - 0.4, 10).rotateZ(Math.PI / 2);
  [...new Set(PILLARS.map((r) => r[1]))].forEach((py) => {
    add(pipeGeo, M.pipe, 0, CEILING - 0.35, mz(py) - 0.25, { shadow: false, receive: false });
  });
  const lampGeo = new THREE.SphereGeometry(0.09, 12, 8);
  const cordGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.5, 4);
  const aisles = [402, 1474].map(mx);
  aisles.forEach((x) => {
    for (let z = -3.4; z <= 4.8; z += 2.05) {
      add(lampGeo, M.lamp, x, CEILING - 0.5, z, { shadow: false, receive: false });
      add(cordGeo, M.black, x, CEILING - 0.25, z, { shadow: false, receive: false });
    }
  });

  // ---------- Taman ----------
  const g = box(GARDEN);
  add(cube(g.w, 0.38, g.d), M.white, g.x, 0.19, g.z);
  add(cube(g.w - 0.24, 0.04, g.d - 0.24), M.grass, g.x, 0.39, g.z, { shadow: false });
  [
    [0, 0, 0.55],
    [0.35, 0.5, 0.4],
    [-0.4, -0.45, 0.42],
    [0.2, -0.9, 0.3],
    [-0.25, 0.95, 0.32],
  ].forEach(([dx, dz, r]) => {
    const bush = add(new THREE.IcosahedronGeometry(r, 1), M.leaf, g.x + dx, 0.41 + r * 0.75, g.z + dz);
    bush.scale.y = 1.25;
  });

  // ---------- Booth ----------
  // Banner dipotong jadi empat bagian: depan, sisi kiri, sisi kanan, dan lidah di atas meja.
  const loader = new THREE.TextureLoader();
  const bannerMat = (url) => {
    const tex = loader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.55,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
  };
  const B = {
    front: bannerMat(bannerFrontUrl),
    left: bannerMat(bannerLeftUrl),
    right: bannerMat(bannerRightUrl),
    top: bannerMat(bannerTopUrl),
  };

  const DESK = { depth: 0.45, width: 0.6, height: 0.74 };
  const WRAP = DESK.depth / 3; // banner hanya menutup sepertiga meja di sisi dan di atas
  const SHEET = 0.008;
  const G = {
    top: cube(DESK.depth, 0.03, DESK.width),
    deskLeg: cube(0.03, DESK.height - 0.03, 0.03),
    hit: cube(DESK.depth, DESK.height, DESK.width),
    front: cube(SHEET, DESK.height, DESK.width + SHEET * 2),
    side: cube(WRAP, DESK.height, SHEET),
    // Lidah atas: tepi bawah gambar menempel di lipatan depan, lalu naik ke arah belakang meja.
    flap: new THREE.PlaneGeometry(DESK.width, WRAP).rotateX(-Math.PI / 2).rotateY(Math.PI / 2),
    seat: cube(0.38, 0.04, 0.38),
    back: cube(0.03, 0.3, 0.38),
    leg: cube(0.03, 0.44, 0.03),
    backLeg: cube(0.03, 0.82, 0.03),
  };
  const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
  const K = M.black;
  const pickables = [];
  const boothByNumber = new Map();

  const chair = (parent, z) => {
    const c = new THREE.Group();
    c.position.set(-0.52, 0, z);
    add(G.seat, M.chairBlue, 0, 0.44, 0, { parent: c });
    add(G.back, M.chairBlue, -0.18, 0.67, 0, { parent: c });
    [-0.17, 0.17].forEach((lz) => {
      add(G.leg, M.cream, 0.17, 0.22, lz, { parent: c });
      add(G.backLeg, M.cream, -0.18, 0.41, lz, { parent: c });
    });
    parent.add(c);
  };

  BOOTHS.forEach((booth) => {
    const b = box(booth.rect);
    const group = new THREE.Group();
    group.position.set(b.x, 0, b.z);
    if (booth.facing < 0) group.rotation.y = Math.PI;

    const frontX = DESK.depth / 2;
    const sideX = frontX - WRAP / 2;
    const sideZ = DESK.width / 2 + SHEET / 2;
    const h = DESK.height;

    // Meja.
    add(G.top, M.white, 0, h - 0.015, 0, { parent: group });
    [-1, 1].forEach((sx) =>
      [-1, 1].forEach((sz) =>
        add(G.deskLeg, M.cream, sx * (frontX - 0.03), (h - 0.03) / 2, sz * (DESK.width / 2 - 0.03), { parent: group }),
      ),
    );

    // Urutan sisi BoxGeometry: +x, -x, +y, -y, +z, -z. Meja menghadap +x.
    add(G.front, [B.front, K, K, K, K, K], frontX + SHEET / 2, h / 2, 0, { parent: group });
    add(G.side, [K, K, K, K, B.left, K], sideX, h / 2, sideZ, { parent: group });
    add(G.side, [K, K, K, K, K, B.right], sideX, h / 2, -sideZ, { parent: group });
    add(G.flap, B.top, sideX, h + 0.006, 0, { parent: group, shadow: false });

    chair(group, -0.21);
    chair(group, 0.21);

    const hit = add(G.hit, hitMat, 0, h / 2, 0, { parent: group, shadow: false, receive: false });
    hit.userData.booth = booth;
    hit.userData.ghost = true;
    pickables.push(hit);
    boothByNumber.set(booth.number, { ...booth, x: b.x, z: b.z });
    scene.add(group);

    // Tanda nama tim di atas booth: setengah transparan, penuh saat booth disorot.
    const tag = document.createElement('div');
    tag.className = `v-tag ${booth.kind.toLowerCase()}`;
    tag.textContent = booth.name;
    const tagObj = new CSS2DObject(tag);
    tagObj.position.set(b.x, 1.25, b.z);
    scene.add(tagObj);
    labels.push(tagObj);
    booth.tag = tag;
  });

  const marker = add(cube(1.25, 0.02, 0.86), M.gold, 0, 0.012, 0, { shadow: false });
  marker.visible = false;
  marker.userData.ghost = true;

  // ---------- Label area ----------
  label('Taman', g.x, 2.1, g.z);
  label('Tangga', st.x, CEILING + 0.5, st.z);
  BLOCKS.filter((b) => b.name).forEach((b) => {
    const r = box(b.rect);
    label(b.name, r.x, CEILING + 0.5, r.z);
  });
  label('Kantin FILKOM', canteen.x, 0.8, canteen.z);

  // ---------- Kontrol kamera ----------
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.7;
  controls.zoomSpeed = 0.8;
  controls.minDistance = 0.6;
  controls.maxDistance = 42;
  controls.maxPolarAngle = Math.PI / 2 - 0.03;
  controls.screenSpacePanning = false;

  const VIEWS = {
    semua: { label: 'Keseluruhan', pos: [13, 19, 20], target: [0, 0, 0.6] },
    atas: { label: 'Tampak atas', pos: [0, 36, 0.4], target: [0, 0, -0.1] },
    pintu: { label: 'Dari pintu masuk', pos: [-0.15, 1.6, 11.2], target: [-0.15, 1.1, 0] },
    kiri: { label: 'Lorong kiri', pos: [aisles[0], 1.6, 4.6], target: [aisles[0], 0.9, -2] },
    kanan: { label: 'Lorong kanan', pos: [aisles[1], 1.6, 4.6], target: [aisles[1], 0.9, -2] },
  };

  // Kamera tidak boleh masuk ke dalam benda padat, supaya isi pilar, meja, atau lantai tidak terpotong di layar.
  const PAD = 0.4;
  const solids = [];
  const solid = (cx, cz, w, d, top) =>
    solids.push({ x0: cx - w / 2 - PAD, x1: cx + w / 2 + PAD, z0: cz - d / 2 - PAD, z1: cz + d / 2 + PAD, top: top + PAD });
  PILLARS.forEach((r) => { const b = box(r); solid(b.x, b.z, b.w, b.d, CEILING); });
  BLOCKS.forEach(({ rect }) => { const b = box(rect); solid(b.x, b.z, b.w, b.d, CEILING); });
  solid(st.x, st.z, st.w, st.d, CEILING);
  solid(g.x, g.z, g.w, g.d, 1.3);
  boothByNumber.forEach((b) => solid(b.x - b.facing * 0.24, b.z, 1.0, 0.7, 1.0));

  const keepCameraOutOfSolids = () => {
    const p = camera.position;
    const t = controls.target;
    t.x = THREE.MathUtils.clamp(t.x, -12, 12);
    t.z = THREE.MathUtils.clamp(t.z, -13, 12);
    t.y = THREE.MathUtils.clamp(t.y, 0, 40);
    const before = p.clone();
    const insideHall = Math.abs(p.x - hall.x) < hall.w / 2 && Math.abs(p.z - hall.z) < hall.d / 2;
    if (insideHall && p.y < 0.35) p.y = 0.35;
    if (!insideHall && p.y < -PLINTH + 0.4) p.y = -PLINTH + 0.4;
    for (const s of solids) {
      if (p.y >= s.top || p.x <= s.x0 || p.x >= s.x1 || p.z <= s.z0 || p.z >= s.z1) continue;
      // Dorong keluar lewat sisi terdekat.
      const out = [
        [p.x - s.x0, () => (p.x = s.x0)],
        [s.x1 - p.x, () => (p.x = s.x1)],
        [p.z - s.z0, () => (p.z = s.z0)],
        [s.z1 - p.z, () => (p.z = s.z1)],
        [s.top - p.y, () => (p.y = s.top)],
      ].sort((a, b) => a[0] - b[0])[0];
      out[1]();
    }
    // Titik pandang ikut terdorong, supaya arah pandang tidak berbelok saat kamera digeser keluar dari benda.
    t.add(before.sub(p).negate());
  };

  // Kamera mengejar tujuan dari posisi saat ini, jadi bisa dipotong kapan saja tanpa loncatan.
  // Pindah sudut pandang: mulai dari posisi kamera saat ini, jadi bisa dipotong kapan saja.
  // Kalau garis lurus ke tujuan menabrak pilar, meja, atau taman, kamera naik dulu melewati plafon.
  let goal = null;
  const inSolid = (v) =>
    solids.some((s) => v.y < s.top && v.x > s.x0 && v.x < s.x1 && v.z > s.z0 && v.z < s.z1);
  const pathBlocked = (a, b) => {
    const v = new THREE.Vector3();
    for (let i = 1; i < 40; i++) if (inSolid(v.lerpVectors(a, b, i / 40))) return true;
    return false;
  };
  const flyTo = (pos, target, instant = false) => {
    const to = new THREE.Vector3(...pos);
    const toTarget = new THREE.Vector3(...target);
    if (instant || reduceMotion) {
      camera.position.copy(to);
      controls.target.copy(toTarget);
      goal = null;
      return;
    }
    const from = camera.position.clone();
    const lift = pathBlocked(from, to) ? Math.max(0, CEILING + 3 - (from.y + to.y) / 2) : 0;
    goal = {
      from,
      to,
      fromTarget: controls.target.clone(),
      toTarget,
      lift,
      t: 0,
      duration: 0.9 + Math.min(from.distanceTo(to) + lift, 30) / 30,
    };
  };
  controls.addEventListener('start', () => {
    goal = null;
    setActiveView(null);
  });

  // ---------- Antarmuka ----------
  const ui = document.createElement('div');
  ui.innerHTML = `
    <div class="v-panel v-title">
      <span class="eyebrow">07</span>
      <h2>Denah GKM lantai 1</h2>
    </div>
    <div class="v-panel v-views" role="group" aria-label="Sudut pandang">
      ${Object.entries(VIEWS)
        .map(([key, v]) => `<button type="button" data-view="${key}" aria-pressed="false">${v.label}</button>`)
        .join('')}
      <span class="sep"></span>
      <button type="button" data-toggle="labels" aria-pressed="true">Label</button>
    </div>
    <div class="v-tip"></div>`;
  container.append(...ui.children);
  const tip = container.querySelector('.v-tip');
  const viewButtons = [...container.querySelectorAll('[data-view]')];
  const labelButton = container.querySelector('[data-toggle="labels"]');

  function setActiveView(key) {
    viewButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === key)));
  }
  viewButtons.forEach((b) =>
    b.addEventListener('click', () => {
      const v = VIEWS[b.dataset.view];
      flyTo(v.pos, v.target);
      setActiveView(b.dataset.view);
    }),
  );
  labelButton.addEventListener('click', () => {
    const on = labelButton.getAttribute('aria-pressed') !== 'true';
    labelButton.setAttribute('aria-pressed', String(on));
    labels.forEach((l) => (l.visible = on));
  });

  // ---------- Sorot dan klik booth ----------
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovered = null;
  let down = null;

  const pick = (e) => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(pickables, false)[0];
    return { booth: hit?.object.userData.booth ?? null, r };
  };

  const canvas = renderer.domElement;
  canvas.addEventListener('pointermove', (e) => {
    if (e.buttons) return;
    const { booth } = pick(e);
    hovered?.tag.classList.remove('on');
    hovered = booth;
    booth?.tag.classList.add('on');
    if (booth) {
      const b = boothByNumber.get(booth.number);
      marker.position.set(b.x - booth.facing * 0.2, 0.012, b.z);
    }
    marker.visible = !!booth;
    canvas.style.cursor = booth ? 'pointer' : '';
  });
  canvas.addEventListener('pointerleave', () => {
    marker.visible = false;
    tip.classList.remove('show');
  });
  canvas.addEventListener('pointerdown', (e) => {
    down = { x: e.clientX, y: e.clientY };
    tip.classList.remove('show');
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    const { booth } = pick(e);
    if (!booth) return;
    const b = boothByNumber.get(booth.number);
    flyTo([b.x + booth.facing * 2.7, 1.5, b.z + 1.3], [b.x, 0.6, b.z]);
    marker.position.set(b.x - booth.facing * 0.2, 0.012, b.z);
    marker.visible = true;
    setActiveView(null);
  });

  // ---------- Loop ----------
  const clock = new THREE.Clock();
  let running = false;
  const keys = new Set();
  const step = new THREE.Vector3();
  window.addEventListener('keydown', (e) => {
    if (!running || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    keys.add(e.key);
    setActiveView(null);
    e.preventDefault();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key));
  let raf = 0;

  // Label yang terhalang dinding, pilar, atau plafon disembunyikan supaya tidak terlihat menembus bangunan.
  const occluders = [];
  scene.traverse((o) => o.isMesh && !o.userData.ghost && occluders.push(o));
  const sight = new THREE.Raycaster();
  const toLabel = new THREE.Vector3();
  let tick = 0;
  const hideBlockedLabels = () => {
    labels.forEach((l) => {
      toLabel.copy(l.position).sub(camera.position);
      const dist = toLabel.length();
      sight.set(camera.position, toLabel.divideScalar(dist));
      sight.far = dist - 0.25;
      l.element.classList.toggle('far', dist > 9);
      l.element.classList.toggle('blocked', sight.intersectObjects(occluders, false).length > 0);
    });
  };

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.2);
    // Panah atas dan bawah: berjalan maju dan mundur searah pandangan.
    const walk = (keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0);
    if (walk) {
      goal = null;
      // Selama berjalan, titik putar ditaruh tepat di depan kamera. Dengan begitu,
      // menyeret setelahnya terasa seperti menoleh di tempat, tidak mengayun mengelilingi titik yang jauh.
      step.subVectors(controls.target, camera.position);
      if (step.length() > 0.9) controls.target.copy(camera.position).addScaledVector(step.normalize(), 0.8);
      step.subVectors(controls.target, camera.position).setY(0);
      if (step.lengthSq() < 1e-4) step.set(0, 1, 0).applyQuaternion(camera.quaternion).setY(0);
      step.normalize().multiplyScalar(walk * 3.2 * dt);
      camera.position.add(step);
      controls.target.add(step);
    }
    if (goal) {
      goal.t = Math.min(1, goal.t + dt / goal.duration);
      const e = goal.t * goal.t * goal.t * (goal.t * (goal.t * 6 - 15) + 10);
      camera.position.lerpVectors(goal.from, goal.to, e);
      camera.position.y += Math.sin(Math.PI * e) * goal.lift;
      controls.target.lerpVectors(goal.fromTarget, goal.toTarget, e);
      if (goal.t >= 1) goal = null;
    }
    controls.update();
    keepCameraOutOfSolids();
    if (++tick % 3 === 0) hideBlockedLabels();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  };

  flyTo(VIEWS.semua.pos, VIEWS.semua.target, true);
  setActiveView('semua');
  controls.update();

  return {
    start() {
      if (running) return;
      running = true;
      clock.getDelta();
      frame();
    },
    stop() {
      running = false;
      keys.clear();
      cancelAnimationFrame(raf);
    },
    setScale(scale) {
      renderer.setPixelRatio(Math.max(0.6, Math.min(scale * window.devicePixelRatio, 2)));
      renderer.setSize(W, H, false);
    },
  };
}
