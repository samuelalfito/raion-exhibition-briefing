// Denah GKM lantai 1, diukur dari gambar layout (1 px gambar = 1 cm).
// Semua angka di bawah memakai koordinat piksel gambar: [x0, y0, x1, y1].
// Ubah di sini kalau layout berubah, adegan 3D mengikuti.

export const PX_TO_M = 0.01;
export const HALL = [3, 370, 1872, 1964];

export const BLOCKS = [
  { name: 'Gudang', rect: [3, 370, 555, 461] },
  { name: 'Kamar mandi', rect: [1260, 370, 1872, 552] },
  { name: null, rect: [3, 461, 110, 629] },
];

export const STAIRS = [739, 370, 1106, 461];
export const CANTEEN = [3, 3, 1872, 338];
export const GARDEN = [816, 737, 1060, 1747];

const PILLAR_X = [65, 647, 1137, 1719];
const PILLAR_Y = [737, 1242, 1747];
export const PILLARS = PILLAR_Y.flatMap((y) => PILLAR_X.map((x) => [x, y, x + 92, y + 92]));

// Bukaan (garis putus-putus di layout).
export const ENTRANCES = [
  { name: 'Pintu masuk utama', side: 'south', from: 340, to: 1505 },
  { name: 'Akses samping', side: 'west', from: 629, to: 782 },
  { name: 'Akses samping', side: 'west', from: 1610, to: 1762 },
  { name: 'Akses samping', side: 'east', from: 629, to: 782 },
  { name: 'Akses samping', side: 'east', from: 1610, to: 1762 },
];

// Booth: 4 kolom x 4 baris di sisi belakang, lorong kiri dan kanan.
// facing = arah banner (+1 ke kanan, -1 ke kiri).
const BOOTH_COLS = [
  { x: 172, facing: 1 },
  { x: 570, facing: -1 },
  { x: 1244, facing: 1 },
  { x: 1642, facing: -1 },
];
const BOOTH_ROWS = [859, 951, 1043, 1135];

// Urutan booth per kolom, dari belakang ke depan. App dan game sengaja diselang-seling.
// Tukar urutan baris di sini untuk mengubah penempatan.
const PROJECTS = [
  ['Androzon', 'CurhatFinder'],
  ['JamStone', 'Detergentnation'],
  ['Champion', 'NusaGizi'],
  ['JamStone', 'Mata Empat'],

  ['JamStone', 'MICRO DEFENCE'],
  ['Androzon', 'Servisu'],
  ['Champion', 'Road Rush'],
  ['Androzon', 'HUNT'],

  ['Androzon', 'RAIH'],
  ['JamStone', 'Echoes of the Final Case'],
  ['Androzon', 'HiGavi'],
  ['JamStone', 'ReKindle'],

  ['Champion', 'TelaahKarier'],
  ['JamStone', 'My Spaceship Is Broken'],
  ['Androzon', 'BrawiGO!'],
  ['Androzon', 'Reloved'],
];

export const BOOTHS = BOOTH_COLS.flatMap((col, c) =>
  BOOTH_ROWS.map((y, r) => {
    const number = c * BOOTH_ROWS.length + r + 1;
    const [kind, project] = PROJECTS[number - 1];
    return { number, kind, name: `${kind} ${project}`, rect: [col.x, y, col.x + 62, y + 62], facing: col.facing };
  }),
);
