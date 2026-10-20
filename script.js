/* =====================================================
   BAGIAN 1: PENGATURAN AWAL
   ===================================================== */
const $ = id => document.getElementById(id);

const B = {
  layout: 'strip',
  filter: 'none',
  secs: 3,
  frame: 0,        // nomor bingkai di daftar FRAMES
  shots: [],       // foto yang sudah diambil
  busy: false,
  cv: null         // gambar hasil lengkap (kalau semua foto sudah diambil)
};

const N = { strip: 4, grid: 4, single: 1 };
const NAMA_LAYOUT = { strip: 'Strip 4 foto', grid: 'Grid 2×2', single: '1 foto' };

const FIL = {
  none:  'none',
  bw:    'grayscale(1) contrast(1.1)',
  sepia: 'sepia(.8) contrast(1.05)',
  warm:  'saturate(1.4) hue-rotate(-12deg) brightness(1.05)'
};

const vid  = $('vid');
const cd   = $('cd');
const fl   = $('flash');
const pv   = $('pvImg');
const acts = $('acts');
const bm   = $('bmsg');

const sleep = ms => new Promise(r => setTimeout(r, ms));
const EF = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';


/* =====================================================
   BAGIAN 2: POLA LATAR BINGKAI
   ===================================================== */
const solid = c => (x, W, H) => {
  x.fillStyle = c;
  x.fillRect(0, 0, W, H);
};

const gradient = (a, b) => (x, W, H) => {
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
};

const dots = (base, dot, gap = 36, r = 7) => (x, W, H) => {
  solid(base)(x, W, H);
  x.fillStyle = dot;
  for (let j = 0, row = 0; j < H + gap; j += gap, row++) {
    for (let i = (row % 2) * gap / 2; i < W + gap; i += gap) {
      x.beginPath();
      x.arc(i, j, r, 0, Math.PI * 2);
      x.fill();
    }
  }
};

const stripes = (colors, w = 40) => (x, W, H) => {
  for (let i = 0, k = 0; i < W; i += w, k++) {
    x.fillStyle = colors[k % colors.length];
    x.fillRect(i, 0, w, H);
  }
};

const checker = (a, b, s = 40) => (x, W, H) => {
  for (let j = 0; j * s < H; j++) {
    for (let i = 0; i * s < W; i++) {
      x.fillStyle = (i + j) % 2 ? a : b;
      x.fillRect(i * s, j * s, s, s);
    }
  }
};

const gingham = (c, s = 36) => (x, W, H) => {
  solid('#fff')(x, W, H);
  x.fillStyle = c;
  x.globalAlpha = 0.5;
  for (let i = 0; i < W; i += s * 2) x.fillRect(i, 0, s, H);
  for (let j = 0; j < H; j += s * 2) x.fillRect(0, j, W, s);
  x.globalAlpha = 1;
};


/* =====================================================
   BAGIAN 3: DAFTAR BINGKAI
   name = nama | icon = emoji tombol | prev = warna tombol
   bg = pola latar | emo = hiasan (emoji teks atau foto Image)
   overlay = PNG yang ditumpuk di atas (khusus Punyaku)
   "Punyaku" harus tetap paling akhir.
   ===================================================== */
const FRAMES = [
  { name: 'Permen', icon: '🍭', prev: '#ffc2d9',
    bg: dots('#ffd1e3', '#ffffff'), emo: ['🍭', '🍬', '🧁'] },

  { name: 'Pelangi', icon: '🌈',
    prev: 'linear-gradient(90deg,#ffb3ba,#ffdfba,#baffc9,#bae1ff)',
    bg: stripes(['#ffb3ba', '#ffdfba', '#fdffba', '#baffc9', '#bae1ff', '#d7baff'], 44),
    emo: ['🌈', '☁️', '⭐'] },

  { name: 'Cinta', icon: '💖', prev: '#ff8fb1',
    bg: gradient('#ffb3cc', '#ff7aa2'), emo: ['💖', '💕', '💗', '💘'] },

  { name: 'Galaksi', icon: '🌙', prev: 'linear-gradient(#1b1f4b,#3b2a78)',
    bg: gradient('#141840', '#3b2a78'), emo: ['⭐', '✨', '🌙', '🪐'] },

  { name: 'Piknik', icon: '🍓',
    prev: 'repeating-linear-gradient(45deg,#ff9a9a 0 6px,#fff 6px 12px)',
    bg: gingham('#e63946'), emo: ['🍓', '🍒', '🧺'] },

  { name: 'Taman', icon: '🌸', prev: '#cfe8a0',
    bg: dots('#d6edab', '#bfe08a', 44, 10), emo: ['🌸', '🌼', '🌷', '🦋'] },

  { name: 'Meong', icon: '🐱', prev: '#ffe6c7',
    bg: dots('#fff0dc', '#ffd9a8', 40, 8), emo: ['🐱', '🐾', '🐟', '🧶'] },

  { name: 'Retro', icon: '👾',
    prev: 'linear-gradient(135deg,#4a35b0 50%,#7a63e0 50%)',
    bg: checker('#4a35b0', '#6a52d6', 44), emo: ['👾', '🕹️', '💾', '⚡'] },

  { name: 'Ceria', icon: '😄', prev: '#ffe066',
    bg: dots('#ffe066', '#ffd23f', 44, 11), emo: ['😄', '🌻', '🎈', '😎'] },

  { name: 'Pantai', icon: '🐠', prev: 'linear-gradient(#8fd3ff,#ffe9b0)',
    bg: gradient('#8fd3ff', '#ffe9b0'), emo: ['🐠', '🐚', '🌊', '🏖️', '🦀'] },

  { name: 'Pesta', icon: '🎉', prev: '#ffd6a5',
    bg: stripes(['#ffd6a5', '#fff1d6'], 34), emo: ['🎉', '🎈', '🎂', '🎁'] },

  { name: 'Polaroid', icon: '🖼️', prev: '#ffffff',
    bg: solid('#ffffff'), emo: [] },

  { name: 'Polos', icon: '⬛', prev: '#2d323c',
    bg: solid('#2d323c'), emo: [] },

  { name: 'Punyaku', icon: '📷', prev: '#ffd1e3',
    bg: solid('#ffd1e3'), emo: [], overlay: null }
];

const IDX_SENDIRI = FRAMES.length - 1;
const SENDIRI = FRAMES[IDX_SENDIRI];


/* =====================================================
   BAGIAN 4: ALAT GAMBAR
   ===================================================== */
function rr(x, px, py, w, h, r) {
  x.beginPath();
  x.moveTo(px + r, py);
  x.arcTo(px + w, py, px + w, py + h, r);
  x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r);
  x.arcTo(px, py, px + w, py, r);
  x.closePath();
}

// Satu hiasan di titik (0,0): emoji atau fotomu
function hias(x, item, size) {
  if (typeof item === 'string') {
    x.font = size + 'px ' + EF;
    x.fillText(item, 0, 0);
  } else {
    const s = size * 1.8;
    const r = item.width / item.height;
    const w = r >= 1 ? s : s * r;
    const h = r >= 1 ? s / r : s;
    x.drawImage(item, -w / 2, -h / 2, w, h);
  }
}

// Foto kosong sebagai tempat foto yang belum diambil
const KOSONG = {};
function fotoKosong(nomor) {
  if (KOSONG[nomor]) return KOSONG[nomor];

  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 600;
  const x = c.getContext('2d');

  const g = x.createLinearGradient(0, 0, 0, 600);
  g.addColorStop(0, '#e3e8f2');
  g.addColorStop(1, '#b9c1d4');
  x.fillStyle = g;
  x.fillRect(0, 0, 800, 600);

  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.font = '190px ' + EF;
  x.fillText('🙂', 400, 260);

  x.fillStyle = '#6b7285';
  x.font = '700 48px Poppins, system-ui, sans-serif';
  x.fillText('Foto ' + nomor, 400, 480);

  KOSONG[nomor] = c;
  return c;
}


/* =====================================================
   BAGIAN 5: SUSUN BINGKAI LENGKAP
   ===================================================== */
function susun(daftarFoto) {
  const L = B.layout;
  const f = FRAMES[B.frame];

  const P = 48;     // jarak tepi ke foto
  const G = 26;     // jarak antar foto
  const F = 120;    // tinggi footer

  const pw   = (L === 'single') ? 760 : (L === 'grid') ? 380 : 520;
  const ph   = pw * 0.75;
  const cols = (L === 'grid') ? 2 : 1;
  const rows = (L === 'strip') ? 4 : (L === 'grid') ? 2 : 1;

  const W = P * 2 + cols * pw + (cols - 1) * G;
  const H = P + rows * ph + (rows - 1) * G + F;

  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d');

  // 1) Latar
  f.bg(x, W, H);

  // 2) Taburan hiasan
  if (f.emo.length) {
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    x.textAlign = 'center';
    x.textBaseline = 'middle';

    const adaFoto = f.emo.some(e => typeof e !== 'string');
    const step = adaFoto ? 110 : 64;

    let n = 0;
    for (let j = step / 2; j < H; j += step) {
      for (let i = step / 2; i < W; i += step) {
        x.save();
        x.translate(i + (rnd() - .5) * 18, j + (rnd() - .5) * 18);
        x.rotate((rnd() - .5) * .8);
        hias(x, f.emo[n++ % f.emo.length], 26 + rnd() * 14);
        x.restore();
      }
    }
  }

  // 3) Foto dengan pinggiran putih membulat
  const pos = [];
  daftarFoto.slice(0, N[L]).forEach((foto, i) => {
    const px = P + (i % cols) * (pw + G);
    const py = P + Math.floor(i / cols) * (ph + G);
    pos.push([px, py]);

    x.save();
    x.shadowColor = 'rgba(0,0,0,.25)';
    x.shadowBlur = 14;
    x.shadowOffsetY = 4;
    x.fillStyle = '#fff';
    rr(x, px - 9, py - 9, pw + 18, ph + 18, 18);
    x.fill();
    x.restore();

    x.save();
    rr(x, px, py, pw, ph, 10);
    x.clip();
    x.drawImage(foto, px, py, pw, ph);
    x.restore();
  });

  // 4) Stiker di pojok setiap foto
  if (f.emo.length) {
    x.textAlign = 'center';
    x.textBaseline = 'middle';

    pos.forEach(([px, py], i) => {
      const kiri = (i % 2 === 0);
      x.save();
      x.translate(kiri ? px + 6 : px + pw - 6, py + 6);
      x.rotate(kiri ? -0.25 : 0.25);
      hias(x, f.emo[i % f.emo.length], 58);
      x.restore();
    });
  }

  // 5) Bingkai PNG buatanmu
  if (f.overlay) {
    x.drawImage(f.overlay, 0, 0, W, H);
  }

  // 6) Footer: teks dan tanggal
  const judul = $('judul').value.trim() || 'Klik Klik Booth';
  const tanggal = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  let u = 32;
  const font = () => '700 ' + u + 'px Poppins, system-ui, sans-serif';
  x.font = font();
  while (x.measureText(judul).width > W - P * 2 - 60 && u > 16) {
    u -= 2;
    x.font = font();
  }

  const lebarPapan = Math.max(x.measureText(judul).width, 200) + 60;
  const cy = H - F / 2 + 6;

  x.save();
  x.globalAlpha = 0.9;
  x.fillStyle = '#fff';
  rr(x, (W - lebarPapan) / 2, cy - 44, lebarPapan, 82, 22);
  x.fill();
  x.restore();

  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = '#23262e';
  x.font = font();
  x.fillText(judul, W / 2, cy - 12);

  x.fillStyle = '#6b6f7a';
  x.font = '400 15px Poppins, system-ui, sans-serif';
  x.fillText(tanggal, W / 2, cy + 18);

  return c;
}


/* =====================================================
   BAGIAN 6: KOTAK KANAN (contoh sekaligus hasil)
   Foto yang sudah diambil tampil asli, sisanya foto kosong.
   Kalau semua foto sudah diambil, tombol Unduh/Cetak muncul.
   ===================================================== */
function segarPreview() {
  const n = N[B.layout];
  const daftar = [];
  for (let i = 0; i < n; i++) {
    daftar.push(B.shots[i] || fotoKosong(i + 1));
  }

  const c = susun(daftar);
  pv.src = c.toDataURL('image/png');

  const lengkap = B.shots.length >= n;
  if (lengkap) B.cv = c;
  acts.hidden = !lengkap;

  $('pvCap').textContent = lengkap
    ? 'Hasil fotomu'
    : 'Contoh: ' + FRAMES[B.frame].name + ' · ' + NAMA_LAYOUT[B.layout];
}


/* =====================================================
   BAGIAN 7: TOMBOL PILIH BINGKAI
   ===================================================== */
function pilihBingkai(i) {
  B.frame = i;
  document.querySelectorAll('.fr').forEach((btn, k) => {
    btn.setAttribute('aria-pressed', String(k === i));
  });
  segarPreview();
}

FRAMES.forEach((f, i) => {
  const b = document.createElement('button');
  b.className = 'fr';
  b.setAttribute('aria-pressed', String(i === B.frame));
  b.innerHTML =
    '<span class="pv" style="background:' + f.prev + '">' + f.icon + '</span>' +
    '<span>' + f.name + '</span>';
  b.addEventListener('click', () => pilihBingkai(i));
  $('frames').appendChild(b);
});

$('judul').addEventListener('input', segarPreview);


/* =====================================================
   BAGIAN 8: PENGATURAN (tata letak, filter, hitung mundur)
   ===================================================== */
document.querySelectorAll('select[data-k]').forEach(s => {
  s.addEventListener('change', () => {
    const k = s.dataset.k;
    B[k] = (k === 'secs') ? +s.value : s.value;

    // Filter langsung terlihat di kamera
    if (k === 'filter') vid.style.filter = FIL[B.filter];

    // Ganti tata letak: foto lama dibuang
    if (k === 'layout') {
      B.shots = [];
      segarPreview();
    }
  });
});


/* =====================================================
   BAGIAN 9: KAMERA
   ===================================================== */
$('cam').addEventListener('click', async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    bm.textContent = 'Browser ini tidak mendukung akses kamera. Gunakan Chrome atau Edge.';
    return;
  }

  try {
    vid.srcObject = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: false
    });
    await vid.play();

    $('ph').hidden = true;
    $('cam').hidden = true;
    $('shoot').disabled = false;
    bm.textContent = 'Kamera siap. Klik Mulai foto atau tekan Spasi.';

  } catch (e) {
    const n = e && e.name;
    if (n === 'NotAllowedError') {
      bm.textContent = 'Izin kamera ditolak. Klik ikon gembok di address bar, izinkan kamera, lalu coba lagi.';
    } else if (n === 'NotFoundError') {
      bm.textContent = 'Kamera tidak ditemukan di laptop ini.';
    } else {
      bm.textContent = 'Kamera tidak bisa dibuka. Pastikan tidak dipakai aplikasi lain.';
    }
  }
});


/* =====================================================
   BAGIAN 10: AMBIL FOTO
   ===================================================== */
function ambil() {
  const w = vid.videoWidth;
  const h = vid.videoHeight;

  // Potong bagian tengah video jadi rasio 4:3
  const sw = Math.min(w, h * 4 / 3);
  const sh = sw * 3 / 4;

  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 600;

  const x = c.getContext('2d');
  x.filter = FIL[B.filter];
  x.translate(800, 0);    // balik horizontal biar sama dengan preview
  x.scale(-1, 1);
  x.drawImage(vid, (w - sw) / 2, (h - sh) / 2, sw, sh, 0, 0, 800, 600);

  return c;
}

async function mulai() {
  if (B.busy || $('shoot').disabled) return;

  B.busy = true;
  B.shots = [];
  $('shoot').disabled = true;
  segarPreview();                     // kotak kanan kembali kosong

  const n = N[B.layout];

  for (let i = 0; i < n; i++) {
    bm.textContent = 'Foto ' + (i + 1) + ' dari ' + n;

    // Hitung mundur
    for (let s = B.secs; s > 0; s--) {
      cd.textContent = s;
      cd.classList.add('on');
      await sleep(1000);
    }
    cd.classList.remove('on');

    // Flash + ambil foto, lalu langsung tampil di kotak kanan
    fl.classList.add('on');
    B.shots.push(ambil());
    segarPreview();
    await sleep(180);
    fl.classList.remove('on');
    await sleep(600);
  }

  bm.textContent = 'Selesai! Hasilmu ada di kotak kanan.';
  B.busy = false;
  $('shoot').disabled = false;
}

$('shoot').addEventListener('click', mulai);

// Tombol Spasi = mulai foto
document.addEventListener('keydown', e => {
  const sedangMengetik = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName);
  if (e.code === 'Space' && !sedangMengetik) {
    e.preventDefault();
    mulai();
  }
});


/* =====================================================
   BAGIAN 11: TOMBOL HASIL
   ===================================================== */
$('again').addEventListener('click', () => {
  B.shots = [];
  segarPreview();
  bm.textContent = 'Siap foto lagi.';
});

$('prt').addEventListener('click', () => window.print());

$('dl').addEventListener('click', async () => {
  if (!B.cv) return;

  const blob = await new Promise(r => B.cv.toBlob(r, 'image/png'));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'photobooth-' + Date.now() + '.png';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});


/* =====================================================
   BAGIAN 12: BINGKAI DARI FOTOMU SENDIRI
   ===================================================== */
function bacaGambar(file) {
  return new Promise((ok, gagal) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = gagal;
    img.src = URL.createObjectURL(file);
  });
}

function pvSendiri() {
  return document.querySelectorAll('.fr')[IDX_SENDIRI].querySelector('.pv');
}

// Stiker foto
$('btnStiker').addEventListener('click', () => $('upStiker').click());

$('upStiker').addEventListener('change', async e => {
  const files = [...e.target.files];
  if (!files.length) return;

  try {
    SENDIRI.emo = await Promise.all(files.map(bacaGambar));
  } catch (err) {
    bm.textContent = 'Salah satu gambar tidak bisa dibaca. Coba file PNG atau JPG.';
    return;
  }

  pvSendiri().textContent = '';
  pvSendiri().style.background = 'url(' + SENDIRI.emo[0].src + ') center / cover';

  pilihBingkai(IDX_SENDIRI);
  e.target.value = '';
});

// Warna latar
$('warnaLatar').addEventListener('input', e => {
  SENDIRI.bg = solid(e.target.value);
  if (!SENDIRI.emo.length) pvSendiri().style.background = e.target.value;
  pilihBingkai(IDX_SENDIRI);
});

// Bingkai PNG
$('btnOverlay').addEventListener('click', () => $('upOverlay').click());

$('upOverlay').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    SENDIRI.overlay = await bacaGambar(file);
  } catch (err) {
    bm.textContent = 'Gambar bingkai tidak bisa dibaca. Pakai file PNG.';
    return;
  }

  pilihBingkai(IDX_SENDIRI);
  e.target.value = '';
});

// Hapus
$('btnReset').addEventListener('click', () => {
  SENDIRI.emo = [];
  SENDIRI.overlay = null;
  SENDIRI.bg = solid($('warnaLatar').value);

  pvSendiri().textContent = '📷';
  pvSendiri().style.background = $('warnaLatar').value;

  pilihBingkai(IDX_SENDIRI);
});


/* =====================================================
   BAGIAN 13: TAMPILKAN CONTOH PERTAMA KALI
   ===================================================== */
segarPreview();