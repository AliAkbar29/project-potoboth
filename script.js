/* =====================================================
   BAGIAN 1: PENGATURAN AWAL
   ===================================================== */
const $ = id => document.getElementById(id);

const B = {
  layout: 'strip',
  filter: 'none',
  secs: 3,
  frame: 0,        
  shots: [],       
  busy: false,
  cv: null         
};

// Ubah default menjadi 3 foto (Strip 3) agar pas dengan desain bingkai
const N = { strip: 3, grid: 4, single: 1 };
const NAMA_LAYOUT = { strip: 'Strip 3 foto', grid: 'Grid 2×2', single: '1 foto' };

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

// Helper fungsi dasar
const solid = c => (x, W, H) => { x.fillStyle = c; x.fillRect(0, 0, W, H); };

function rr(x, px, py, w, h, r) {
  x.beginPath(); x.moveTo(px + r, py);
  x.arcTo(px + w, py, px + w, py + h, r);
  x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r);
  x.arcTo(px, py, px + w, py, r);
  x.closePath();
}

/* =====================================================
   BAGIAN 2: DESAIN BINGKAI (PERSIS SEPERTI GAMBAR)
   ===================================================== */
const FRAMES = [
  {
    name: 'Biru Kotak', icon: '🧊', prev: '#b3cde0', layout: 'strip',
    drawBg: (x, W, H) => {
      // Latar putih
      solid('#fff')(x, W, H);
      // Pola kotak-kotak biru
      x.fillStyle = '#b3cde0';
      const s = 30;
      for(let i=0; i<W; i+=s*2) x.fillRect(i, 0, s, H);
      for(let j=0; j<H; j+=s*2) x.fillRect(0, j, W, s);
      // Gambar pita biru (kiri atas)
      x.fillStyle = '#6a9bc3';
      x.beginPath(); x.moveTo(20, 80); x.lineTo(60, 110); x.lineTo(20, 140); x.fill();
      // Gambar bunga (kanan atas)
      x.font = '60px ' + EF; x.fillText('🌸', W-80, 80);
    }
  },
  {
    name: 'Classical', icon: '🎻', prev: '#5c1a1b', layout: 'strip',
    drawBg: (x, W, H) => {
      // Latar merah gelap
      solid('#3d0b0b')(x, W, H);
      // Border luar
      x.strokeStyle = '#8b1a1a'; x.lineWidth = 15;
      x.strokeRect(15, 15, W-30, H-30);
      // Judul Classical
      x.fillStyle = '#fff'; x.font = 'italic 80px serif'; x.textAlign = 'center';
      x.fillText('Classical', W/2, 100);
      x.font = '30px serif'; x.fillText('music', W/2 - 60, 60);
      // Barcode
      x.fillStyle = '#111'; x.fillRect(W/2 - 100, H - 80, 200, 40);
      x.fillStyle = '#fff'; x.font = '15px monospace'; x.fillText('08/06/2026', W/2, H - 20);
    }
  },
  {
    name: 'Love Sulus', icon: '❤️', prev: '#c03c3c', layout: 'strip', isHeart: true,
    drawBg: (x, W, H) => {
      // Latar merah hati
      solid('#b32d2d')(x, W, H);
      // Teks di bawah
      x.fillStyle = '#fff'; x.font = 'bold 70px serif'; x.textAlign = 'center';
      x.fillText('777', W/2, H - 80);
      x.font = 'italic 70px serif'; x.fillText('SULUS', W/2, H - 20);
    }
  },
  {
    name: 'Bear Coklat', icon: '🧸', prev: '#f2d7d5', layout: 'strip',
    drawBg: (x, W, H) => {
      // Latar kotak coklat muda
      solid('#f4e8d3')(x, W, H);
      x.fillStyle = '#d1bca3';
      const s = 30;
      for(let i=0; i<W; i+=s*2) x.fillRect(i, 0, s, H);
      for(let j=0; j<H; j+=s*2) x.fillRect(0, j, W, s);
      // Stiker
      x.font = '80px ' + EF;
      x.fillText('🧸', 50, 150);
      x.fillText('🐻', W-100, 150);
      x.fillText('📷', 50, H/2);
      x.fillText('⭐', W-100, H-100);
    }
  },
  {
    name: 'Gingham Merah', icon: '🎀', prev: '#c03c3c', layout: 'strip',
    drawBg: (x, W, H) => {
      // Latar kotak merah
      solid('#fff')(x, W, H);
      x.fillStyle = '#b32d2d';
      const s = 30;
      for(let i=0; i<W; i+=s*2) x.fillRect(i, 0, s, H);
      for(let j=0; j<H; j+=s*2) x.fillRect(0, j, W, s);
      // Pita di kiri
      x.fillStyle = '#8b1a1a'; x.beginPath(); x.arc(50, H/2, 40, 0, Math.PI*2); x.fill();
      // Bintang di kanan
      x.fillStyle = '#8b1a1a'; x.font = '80px ' + EF; x.fillText('🌟', W-100, H/2 + 20);
    }
  },
  {
    name: 'Leopard Film', icon: '🐆', prev: '#e6b8c4', layout: 'strip',
    drawBg: (x, W, H) => {
      // Latar Leopard Pink
      solid('#e6b8c4')(x, W, H);
      x.fillStyle = '#4a1a24';
      for(let i=0; i<80; i++) {
        let cx = Math.random()*W, cy = Math.random()*H, r = Math.random()*10+5;
        x.beginPath(); x.arc(cx, cy, r, 0, Math.PI*2); x.fill();
      }
      // Bingkai Film Hitam
      x.fillStyle = '#0a0a0a'; x.fillRect(40, 30, W-80, H-60);
      x.fillStyle = '#222';
      x.fillRect(40, H/3 - 10, W-80, 20); x.fillRect(40, 2*H/3 - 10, W-80, 20);
      // Tulisan Film
      x.fillStyle = '#ffdb58'; x.font = 'bold 12px sans-serif'; x.textAlign = 'center';
      for(let i=0; i<10; i++) {
        x.fillText('▼', 55, 60 + i*80); x.fillText('►', W-55, 60 + i*80);
        x.save(); x.translate(70, 40 + i*70); x.rotate(Math.PI/2); x.fillText('MADE 400UC', 0, 0); x.restore();
      }
    }
  },
  { 
    name: 'Punyaku', icon: '📷', prev: '#ffd1e3', layout: 'strip',
    bg: solid('#ffd1e3'), emo: [], overlay: null 
  }
];

const IDX_SENDIRI = FRAMES.length - 1;
const SENDIRI = FRAMES[IDX_SENDIRI];

/* =====================================================
   BAGIAN 3: SUSUN BINGKAI (DINAMIS)
   ===================================================== */
function susun(daftarFoto) {
  const L = B.layout;
  const f = FRAMES[B.frame];

  // Pengaturan ukuran dinamis berdasarkan layout
  let P = 48, G = 26, F = 100;
  let pw = 520;
  let ph = pw * 0.75;
  let cols = 1;
  let rows = N[L];

  if (L === 'grid') { cols = 2; rows = 2; pw = 380; ph = pw * 0.75; }
  if (L === 'single') { cols = 1; rows = 1; pw = 760; ph = pw * 0.75; }

  // Hitung ukuran kanvas
  const W = P * 2 + cols * pw + (cols - 1) * G;
  const H = P + rows * ph + (rows - 1) * G + F;

  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');

  // 1. Gambar Latar Belakang Bingkai
  if (f.drawBg) f.drawBg(x, W, H);
  else if (f.bg) f.bg(x, W, H);

  // 2. Gambar Foto (dengan gaya khusus jika Heart)
  daftarFoto.slice(0, N[L]).forEach((foto, i) => {
    const px = P + (i % cols) * (pw + G);
    const py = P + Math.floor(i / cols) * (ph + G);

    x.save();
    // Jika bingkai Love Sulus, gunakan bentuk Hati (Clipping Path)
    if (f.isHeart) {
      x.beginPath();
      x.moveTo(px + pw/2, py + ph/4);
      x.bezierCurveTo(px + pw/2, py, px, py, px, py + ph/4);
      x.bezierCurveTo(px, py + ph/2, px + pw/2, py + ph, px + pw/2, py + ph);
      x.bezierCurveTo(px + pw/2, py + ph, px + pw, py + ph/2, px + pw, py + ph/4);
      x.bezierCurveTo(px + pw, py, px + pw/2, py, px + pw/2, py + ph/4);
      x.closePath();
      x.clip();
    } else {
      // Bentuk kotak standar untuk bingkai lain
      rr(x, px, py, pw, ph, 6);
      x.clip();
    }
    
    // Gambar fotonya
    x.drawImage(foto, px, py, pw, ph);
    x.restore();
  });

  // 3. Gambar Overlay (Jika pake gambar custom dari user)
  if (f.overlay) x.drawImage(f.overlay, 0, 0, W, H);

  // 4. Teks Bawah
  const judul = $('judul').value.trim() || 'Klik Klik Booth';
  const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  let u = 32;
  const font = () => '700 ' + u + 'px Poppins, system-ui, sans-serif';
  x.font = font();
  while (x.measureText(judul).width > W - P * 2 - 60 && u > 16) { u -= 2; x.font = font(); }
  
  const lebarPapan = Math.max(x.measureText(judul).width, 200) + 60;
  const cy = H - F / 2 + 6;

  x.save();
  x.globalAlpha = 0.9; x.fillStyle = '#fff';
  rr(x, (W - lebarPapan) / 2, cy - 44, lebarPapan, 82, 22); x.fill();
  x.restore();

  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = '#23262e'; x.font = font();
  x.fillText(judul, W / 2, cy - 12);
  x.fillStyle = '#6b6f7a'; x.font = '400 15px Poppins, system-ui, sans-serif';
  x.fillText(tanggal, W / 2, cy + 18);

  return c;
}

/* =====================================================
   BAGIAN 4: PREVIEW & LOGIKA UI
   ===================================================== */
const KOSONG = {};
function fotoKosong(nomor) {
  if (KOSONG[nomor]) return KOSONG[nomor];
  const c = document.createElement('canvas');
  c.width = 800; c.height = 600;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 600);
  g.addColorStop(0, '#e3e8f2'); g.addColorStop(1, '#b9c1d4');
  x.fillStyle = g; x.fillRect(0, 0, 800, 600);
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '190px ' + EF; x.fillText('🙂', 400, 260);
  x.fillStyle = '#6b7285'; x.font = '700 48px Poppins, sans-serif';
  x.fillText('Foto ' + nomor, 400, 480);
  KOSONG[nomor] = c; return c;
}

function segarPreview() {
  const n = N[B.layout];
  const daftar = [];
  for (let i = 0; i < n; i++) daftar.push(B.shots[i] || fotoKosong(i + 1));
  
  try {
    const c = susun(daftar);
    pv.src = c.toDataURL('image/png');
    if (B.shots.length >= n) B.cv = c;
  } catch (e) { console.error(e); }

  acts.hidden = B.shots.length < n;
  $('pvCap').textContent = B.shots.length >= n ? 'Hasil fotomu' : 'Contoh: ' + FRAMES[B.frame].name;
}

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
  b.innerHTML = '<span class="pv" style="background:' + f.prev + '">' + f.icon + '</span><span>' + f.name + '</span>';
  b.addEventListener('click', () => pilihBingkai(i));
  $('frames').appendChild(b);
});

$('judul').addEventListener('input', segarPreview);

/* =====================================================
   BAGIAN 5: PENGATURAN, KAMERA & AMBIL FOTO
   ===================================================== */
document.querySelectorAll('select[data-k]').forEach(s => {
  s.addEventListener('change', () => {
    const k = s.dataset.k;
    B[k] = (k === 'secs') ? +s.value : s.value;
    if (k === 'filter') vid.style.filter = FIL[B.filter];
    if (k === 'layout') { B.shots = []; segarPreview(); }
  });
});

$('cam').addEventListener('click', async () => {
  try {
    vid.srcObject = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: false
    });
    await vid.play();
    $('ph').hidden = true; $('cam').hidden = true; $('shoot').disabled = false;
    bm.textContent = 'Kamera siap. Klik Mulai foto.';
  } catch (e) { bm.textContent = 'Kamera gagal dibuka.'; }
});

function ambil() {
  const w = vid.videoWidth, h = vid.videoHeight;
  const sw = Math.min(w, h * 4 / 3), sh = sw * 3 / 4;
  const c = document.createElement('canvas'); c.width = 800; c.height = 600;
  const x = c.getContext('2d');
  x.filter = FIL[B.filter];
  x.translate(800, 0); x.scale(-1, 1);
  x.drawImage(vid, (w - sw) / 2, (h - sh) / 2, sw, sh, 0, 0, 800, 600);
  return c;
}

async function mulai() {
  if (B.busy || $('shoot').disabled) return;
  B.busy = true; B.shots = []; $('shoot').disabled = true; segarPreview();
  const n = N[B.layout];

  for (let i = 0; i < n; i++) {
    bm.textContent = 'Foto ' + (i + 1) + ' dari ' + n;
    for (let s = B.secs; s > 0; s--) {
      cd.textContent = s; cd.classList.add('on'); await sleep(1000);
    }
    cd.classList.remove('on');
    fl.classList.add('on'); B.shots.push(ambil()); segarPreview();
    await sleep(180); fl.classList.remove('on'); await sleep(600);
  }
  bm.textContent = 'Selesai! Hasilmu ada di kotak kanan.';
  B.busy = false; $('shoot').disabled = false;
}

$('shoot').addEventListener('click', mulai);
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault(); mulai();
  }
});

/* =====================================================
   BAGIAN 6: UNDUH & BINGKAI CUSTOM
   ===================================================== */
$('again').addEventListener('click', () => { B.shots = []; segarPreview(); bm.textContent = 'Siap foto lagi.'; });
$('prt').addEventListener('click', () => window.print());
$('dl').addEventListener('click', async () => {
  if (!B.cv) return;
  const blob = await new Promise(r => B.cv.toBlob(r, 'image/png'));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'photobooth-' + Date.now() + '.png'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});

function bacaGambar(file) {
  return new Promise((ok, gagal) => {
    const img = new Image(); img.onload = () => ok(img); img.onerror = gagal; img.src = URL.createObjectURL(file);
  });
}
function pvSendiri() { return document.querySelectorAll('.fr')[IDX_SENDIRI].querySelector('.pv'); }

$('btnStiker').addEventListener('click', () => $('upStiker').click());
$('upStiker').addEventListener('change', async e => {
  const files = [...e.target.files]; if (!files.length) return;
  try { SENDIRI.emo = await Promise.all(files.map(bacaGambar)); } catch (err) { return; }
  pvSendiri().textContent = ''; pvSendiri().style.background = 'url(' + SENDIRI.emo[0].src + ') center / cover';
  pilihBingkai(IDX_SENDIRI); e.target.value = '';
});

$('warnaLatar').addEventListener('input', e => {
  SENDIRI.bg = solid(e.target.value);
  if (!SENDIRI.emo.length) pvSendiri().style.background = e.target.value;
  pilihBingkai(IDX_SENDIRI);
});

$('btnOverlay').addEventListener('click', () => $('upOverlay').click());
$('upOverlay').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  try { SENDIRI.overlay = await bacaGambar(file); } catch (err) { return; }
  pilihBingkai(IDX_SENDIRI); e.target.value = '';
});

$('btnReset').addEventListener('click', () => {
  SENDIRI.emo = []; SENDIRI.overlay = null; SENDIRI.bg = solid($('warnaLatar').value);
  pvSendiri().textContent = '📷'; pvSendiri().style.background = $('warnaLatar').value;
  pilihBingkai(IDX_SENDIRI);
});

segarPreview();