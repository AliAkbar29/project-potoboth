/* =====================================================
   BAGIAN 1: PENGATURAN AWAL
   ===================================================== */
const $ = id => document.getElementById(id);

// PEMAKSA CACHE: Menambahkan penanda waktu agar browser tidak menyimpan versi lama
const CACHE_BUSTER = Date.now(); 

const B = {
  layout: 'strip',
  filter: 'none',
  secs: 3,
  frame: 0,        
  shots: [],       
  busy: false,
  cv: null         
};

const N = { strip: 3, grid: 4, single: 1 };
const NAMA_LAYOUT = { strip: 'Strip 3 foto', grid: 'Grid 2×2', single: '1 foto' };

// Daftar Filter yang sudah diperluas
const FIL = {
  none:    'none',
  bw:      'bw',
  sepia:   'sepia',
  warm:    'warm',
  vintage: 'vintage', // Filter Baru
  cool:    'cool',    // Filter Baru
  fade:    'fade'     // Filter Baru
};

const vid  = $('vid');
const cd   = $('cd');
const fl   = $('flash');
const pv   = $('pvImg');
const acts = $('acts');
const bm   = $('bmsg');

const sleep = ms => new Promise(r => setTimeout(r, ms));
const EF = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';

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
   BAGIAN 2: FUNGSI FILTER MANUAL (COMPATIBLE HP)
   ===================================================== */
function applyFilter(canvas, filterName) {
  if (filterName === 'none') return canvas;

  const ctx = canvas.getContext('2d');
  
  // Ambil data pixel
  let imgData;
  try {
    imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch (e) {
    console.error("Gagal membaca pixel (CORS issue):", e);
    return canvas; // Kembalikan gambar asli jika gagal
  }
  
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    switch (filterName) {
      case 'bw':
        // Hitam Putih
        let gray = (r * 0.299) + (g * 0.587) + (b * 0.114);
        data[i] = data[i+1] = data[i+2] = gray;
        break;

      case 'sepia':
        data[i]     = (r * 0.393) + (g * 0.769) + (b * 0.189);
        data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
        data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
        break;

      case 'warm':
        data[i]     = r * 1.2;        
        data[i + 1] = g * 1.05;       
        data[i + 2] = b * 0.8;        
        break;

      case 'vintage':
        // Efek Retro/Kuning Kecoklatan
        data[i]     = (r * 0.9) + (g * 0.5) + (b * 0.1);
        data[i + 1] = (r * 0.3) + (g * 0.8) + (b * 0.2);
        data[i + 2] = (r * 0.1) + (g * 0.4) + (b * 0.6);
        break;

      case 'cool':
        // Efek Dingin (Biru/Teal)
        data[i]     = r * 0.8;
        data[i + 1] = g * 1.0;
        data[i + 2] = b * 1.3;
        break;

      case 'fade':
        // Efek Pudar (Kontras rendah, warna keabu-abuan)
        data[i]     = (r * 0.7) + 40;
        data[i + 1] = (g * 0.7) + 40;
        data[i + 2] = (b * 0.7) + 40;
        break;
    }

    // Pastikan nilai tetap di antara 0 - 255
    data[i]     = Math.min(255, Math.max(0, data[i]));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1]));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2]));
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/* =====================================================
   BAGIAN 3: DESAIN BINGKAI
   ===================================================== */
const FRAMES = [
  {
    name: 'Biru Kotak', icon: '🧊', prev: '#b3cde0', layout: 'strip',
    drawBg: (x, W, H) => {
      solid('#fff')(x, W, H);
      x.fillStyle = '#b3cde0';
      const s = 30;
      for(let i=0; i<W; i+=s*2) x.fillRect(i, 0, s, H);
      for(let j=0; j<H; j+=s*2) x.fillRect(0, j, W, s);
      x.fillStyle = '#6a9bc3';
      x.beginPath(); x.moveTo(20, 80); x.lineTo(60, 110); x.lineTo(20, 140); x.fill();
      x.font = '60px ' + EF; x.fillText('🌸', W-80, 80);
    }
  },
  {
    name: 'Classical', icon: '🎻', prev: '#5c1a1b', layout: 'strip',
    drawBg: (x, W, H) => {
      solid('#3d0b0b')(x, W, H);
      x.strokeStyle = '#8b1a1a'; x.lineWidth = 15;
      x.strokeRect(15, 15, W-30, H-30);
      x.fillStyle = '#fff'; x.font = 'italic 80px serif'; x.textAlign = 'center';
      x.fillText('Classical', W/2, 100);
      x.font = '30px serif'; x.fillText('music', W/2 - 60, 60);
      x.fillStyle = '#111'; x.fillRect(W/2 - 100, H - 80, 200, 40);
    }
  },
  {
    name: 'Love Sulus', icon: '❤️', prev: '#c03c3c', layout: 'strip', isHeart: true,
    drawBg: (x, W, H) => {
      solid('#b32d2d')(x, W, H);
      x.fillStyle = '#fff'; x.font = 'bold 70px serif'; x.textAlign = 'center';
      x.fillText('777', W/2, H - 80);
      x.font = 'italic 70px serif'; x.fillText('SULUS', W/2, H - 20);
    }
  },
  {
    name: 'Bear Coklat', icon: '🧸', prev: '#f2d7d5', layout: 'strip',
    drawBg: (x, W, H) => {
      solid('#f4e8d3')(x, W, H);
      x.fillStyle = '#d1bca3';
      const s = 30;
      for(let i=0; i<W; i+=s*2) x.fillRect(i, 0, s, H);
      for(let j=0; j<H; j+=s*2) x.fillRect(0, j, W, s);
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
      solid('#fff')(x, W, H);
      x.fillStyle = '#b32d2d';
      const s = 30;
      for(let i=0; i<W; i+=s*2) x.fillRect(i, 0, s, H);
      for(let j=0; j<H; j+=s*2) x.fillRect(0, j, W, s);
      x.fillStyle = '#8b1a1a'; x.beginPath(); x.arc(50, H/2, 40, 0, Math.PI*2); x.fill();
      x.fillStyle = '#8b1a1a'; x.font = '80px ' + EF; x.fillText('🌟', W-100, H/2 + 20);
    }
  },
  {
    name: 'Leopard Film', icon: '🐆', prev: '#e6b8c4', layout: 'strip',
    drawBg: (x, W, H) => {
      solid('#e6b8c4')(x, W, H);
      x.fillStyle = '#4a1a24';
      for(let i=0; i<80; i++) {
        let cx = Math.random()*W, cy = Math.random()*H, r = Math.random()*10+5;
        x.beginPath(); x.arc(cx, cy, r, 0, Math.PI*2); x.fill();
      }
      x.fillStyle = '#0a0a0a'; x.fillRect(40, 30, W-80, H-60);
      x.fillStyle = '#222';
      x.fillRect(40, H/10 - 10, W-80, 20); x.fillRect(40, 2*H/3 - 10, W-80, 20);
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
   BAGIAN 4: SUSUN BINGKAI (Teks Lebih Estetik)
   ===================================================== */
function susun(daftarFoto) {
  const L = B.layout;
  const f = FRAMES[B.frame];

  let P = 48, G = 26, F = 120; // F (Footer) ditambah sedikit agar lega
  let pw = 520;
  let ph = pw * 0.75;
  let cols = 1;
  let rows = N[L];

  if (L === 'grid') { cols = 2; rows = 2; pw = 380; ph = pw * 0.75; }
  if (L === 'single') { cols = 1; rows = 1; pw = 760; ph = pw * 0.75; }

  const W = P * 2 + cols * pw + (cols - 1) * G;
  const H = P + rows * ph + (rows - 1) * G + F;

  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');

  if (f.drawBg) f.drawBg(x, W, H);
  else if (f.bg) f.bg(x, W, H);

  daftarFoto.slice(0, N[L]).forEach((foto, i) => {
    const px = P + (i % cols) * (pw + G);
    const py = P + Math.floor(i / cols) * (ph + G);

    x.save();
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
      rr(x, px, py, pw, ph, 6);
      x.clip();
    }
    x.drawImage(foto, px, py, pw, ph);
    x.restore();
  });

  if (f.overlay) x.drawImage(f.overlay, 0, 0, W, H);

  // ==========================================
  // 5. TEKS BAWAH (GAYA BARU YANG ESTETIK)
  // ==========================================
  const judul = $('judul').value.trim() || 'Photobooth era';
  const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Warna teks menyesuaikan warna bingkai (jika background gelap, teks jadi putih)
  // Kita gunakan warna kontras yang aman: Putih dengan bayangan, atau Abu Gelap
  const isDarkBg = ['Classical', 'Leopard Film'].includes(f.name);
  const textColor = isDarkBg ? '#ffffff' : '#000000';
  const subTextColor = isDarkBg ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

  // Atur ukuran font secara dinamis
  let u = 34;
  const fontTitle = () => `italic 700 ${u}px "Playfair Display", Georgia, serif`; // Font elegan
  x.font = fontTitle();
  
  // Kecilkan font jika teks terlalu panjang
  while (x.measureText(judul).width > W - 100 && u > 16) { 
    u -= 2; 
    x.font = fontTitle(); 
  }

  const cy = H - (F / 1.3) + 10; // Posisi vertikal teks

  // Efek Bayangan Halus (Drop Shadow) agar tulisan terbaca tanpa kotak
  x.shadowColor = isDarkBg ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)';
  x.shadowBlur = 8;
  x.shadowOffsetY = 2;

  x.textAlign = 'center'; 
  x.textBaseline = 'middle';

  // Gambar Judul Utama
  x.fillStyle = textColor;
  x.font = fontTitle();
  x.fillText(judul, W / 2, cy - 10);

  // Gambar Tanggal (Lebih kecil dan tipis)
  x.shadowBlur = 4; // Bayangan lebih tipis untuk tanggal
  x.fillStyle = subTextColor;
  x.font = `500 14px "Poppins", system-ui, sans-serif`;
  x.fillText(tanggal.toUpperCase(), W / 2, cy + 24);

  // Garis aksen dekoratif kecil di atas dan bawah teks
  x.shadowBlur = 0; // Matikan bayangan untuk garis
  x.strokeStyle = textColor;
  x.lineWidth = 1.5;
  x.globalAlpha = 0.5;
  
  const textWidth = x.measureText(judul).width;
  const lineW = Math.min(textWidth + 40, W - 80); // Panjang garis menyesuaikan teks
  
  x.beginPath(); x.moveTo((W - lineW)/2, cy - 35); x.lineTo((W + lineW)/2, cy - 35); x.stroke();
  x.beginPath(); x.moveTo((W - lineW)/2, cy + 45); x.lineTo((W + lineW)/2, cy + 45); x.stroke();
  
  x.globalAlpha = 1; // Kembalikan ke normal

  return c;
}

/* =====================================================
   BAGIAN 5: PREVIEW & LOGIKA UI
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
   BAGIAN 6: PENGATURAN, KAMERA & AMBIL FOTO
   ===================================================== */
document.querySelectorAll('select[data-k]').forEach(s => {
  s.addEventListener('change', () => {
    const k = s.dataset.k;
    B[k] = (k === 'secs') ? +s.value : s.value;
    
    if (k === 'filter') {
      const cssFilter = {
        none: 'none', bw: 'grayscale(1)', sepia: 'sepia(1)', 
        warm: 'sepia(0.3) saturate(1.5)', vintage: 'sepia(0.6) hue-rotate(-20deg)', 
        cool: 'hue-rotate(180deg) saturate(1.2)', fade: 'opacity(0.8) contrast(0.8)'
      };
      vid.style.filter = cssFilter[B.filter] || 'none';
    }
    
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
  
  const tempCanvas = document.createElement('canvas'); 
  tempCanvas.width = 800; 
  tempCanvas.height = 600;
  const x = tempCanvas.getContext('2d');
  
  x.translate(800, 0); x.scale(-1, 1);
  x.drawImage(vid, (w - sw) / 2, (h - sh) / 2, sw, sh, 0, 0, 800, 600);
  
  // Terapkan filter manual
  return applyFilter(tempCanvas, B.filter);
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
    fl.classList.add('on'); 
    B.shots.push(ambil()); 
    segarPreview();
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
   BAGIAN 7: UNDUH & BINGKAI CUSTOM
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