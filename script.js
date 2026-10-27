/* ==========================================================================
   KAOS HAYALETİ (CHAOS GHOST) - 3D LORENZ SİSTEMİ & GENERATIVE ART
   1. Z-Ekseni Derinliği (Boyut Yanılsaması: 1x, 2x, 3x Piksel Ölçeği)
   2. Kelebeğin Kanatları (Sol Kanat: Pembe, Sağ Kanat: Nane Yeşili, Dinamik UI)
   3. Çekim Merkezleri (Kara Delik / Gravity Well Etkisi)
   4. Generative Art (Yavaş Silinen 1200+ İzi & "P" Tuşuyla PNG Fotoğraf Çekme)
   5. Aktif Yüzme (WASD) & Faresiz Menü (Yön Tuşları)
   6. %100 fillRect() Tabanlı 8-Bit Aseprite Estetiği (Sıfır arc/yuvarlak hat)
   ========================================================================== */

// 1. CANVAS VE EKRAN AYARLARI
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const CW = canvas.width;  // 320 px
const CH = canvas.height; // 320 px

// DOM Elementleri
const statusPill = document.getElementById('statusPill');
const oofBanner = document.getElementById('oofBanner');
const dashBanner = document.getElementById('dashBanner');
const photoBanner = document.getElementById('photoBanner');

const scoreDisplay = document.getElementById('scoreDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const zDepthDisplay = document.getElementById('zDepthDisplay');
const wingDisplay = document.getElementById('wingDisplay');
const scaleDisplay = document.getElementById('scaleDisplay');

const dashCooldownFill = document.getElementById('dashCooldownFill');
const dashCooldownText = document.getElementById('dashCooldownText');

const antigravityBtn = document.getElementById('antigravityBtn');
const dashBtn = document.getElementById('dashBtn');
const photoBtn = document.getElementById('photoBtn');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const clearTrailBtn = document.getElementById('clearTrailBtn');
const resetBtn = document.getElementById('resetBtn');

// Slider Elementleri
const sliders = [
  document.getElementById('chaosSlider'),
  document.getElementById('windSlider'),
  document.getElementById('speedSlider')
];
const sliderGroups = [
  document.getElementById('sliderGroup0'),
  document.getElementById('sliderGroup1'),
  document.getElementById('sliderGroup2')
];
const chaosVal = document.getElementById('chaosVal');
const windVal = document.getElementById('windVal');
const speedVal = document.getElementById('speedVal');

// 2. SES SİSTEMİ (Web Audio API - Harici Dosyasız Synthesizer)
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Yıldız Toplama Sesi (Retro Chime)
function playCollectSound() {
  if (!soundEnabled || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.00, now + 0.05); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.11); // D6

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  } catch (e) {}
}

// Antigravity Sesi (Warp Blip)
function playAntigravitySound() {
  if (!soundEnabled || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';

    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.18);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {}
}

// Dash Sesi (Punchy 8-bit Noise/Sweep)
function playDashSound() {
  if (!soundEnabled || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(820, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.16);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  } catch (e) {}
}

// Fotoğraf Deklanşör Sesi (Retro Camera Shutter Click)
function playCameraSound() {
  if (!soundEnabled || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    // Tık sesi
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.setValueAtTime(600, now + 0.04);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.09);

    // Bip sesi
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1480, now + 0.08);
    gain2.gain.setValueAtTime(0.1, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.22);
  } catch (e) {}
}

soundToggleBtn.addEventListener('click', () => {
  initAudio();
  soundEnabled = !soundEnabled;
  soundToggleBtn.textContent = soundEnabled ? '🔊 SES: AÇIK' : '🔇 SES: KAPALI';
  soundToggleBtn.style.color = soundEnabled ? '#fff' : '#ff9bb2';
});

// 3. KLASİK LORENZ ÇEKİCİSİ SİSTEMİ (x, y, z)
let rho = 28.0;         // Rayleigh Sayısı (Kaos Seviyesi)
const sigma = 10.0;     // Prandtl Sayısı
const beta = 8.0 / 3.0; // Geometrik sönümleme
let windForce = 0.0;    // Dış rüzgar/drift
let simSpeed = 1.0;     // Akış hızı (dt)

// Lorenz Faz Uzayı Değişkenleri
let lx = 0.1;
let ly = 0.0;
let lz = 24.0;

// Karakter Ekran Koordinatları ve Hızı
let px = CW / 2;
let py = CH / 2;
let currentVx = 0;
let currentVy = 0;
let facingDir = { x: 1, y: 0 };
let currentScale = 2; // Z-Derinlik ölçeği (1, 2, 3)

// Aktif Oyuncu Hareketi (Akıntıya Karşı Yüzme)
let player_vx = 0;
let player_vy = 0;
const player_accel = 0.44;
const player_max_speed = 3.6;
const player_friction = 0.90;

const moveKeys = {
  w: false,
  a: false,
  s: false,
  d: false
};

// DASH Mekaniği Değişkenleri
const DASH_COOLDOWN_MAX = 120; // 2 saniye
let dashCooldown = 0;
let isDashing = false;
let dashTimer = 0;
const DASH_DURATION = 12;
let dashImpulse = { x: 0, y: 0 };

// Antigravity Durumu
let isAntigravity = false;
let keyboardSpace = false;
let btnSpace = false;

// Skor Sistemi
let score = 0;
let highScore = parseInt(localStorage.getItem('chaosGhostHighScore') || '0', 10);
highScoreDisplay.textContent = String(highScore).padStart(4, '0');

// Hedef Nesne (Altın Yıldız / Şeker)
const target = {
  x: CW * 0.35,
  y: CH * 0.45
};

// Generative Art İçin Çok Yavaş Silinen Zengin Yörünge İzi (1200+ nokta)
const trail = [];
const MAX_TRAIL = 1200;

const floatingScores = [];
const burstParticles = [];

// Gece Gökyüzü Arka Plan Sabit Piksel Yıldızları
const bgStars = [];
for (let i = 0; i < 48; i++) {
  bgStars.push({
    x: Math.floor(Math.random() * CW),
    y: Math.floor(Math.random() * CH),
    color: ['#1e2c4d', '#2c3e6b', '#485f9e', '#ffd166', '#ff7597'][Math.floor(Math.random() * 5)],
    size: Math.random() > 0.8 ? 2 : 1,
    blinkPeriod: 30 + Math.floor(Math.random() * 70),
    phase: Math.floor(Math.random() * 100)
  });
}

// 4. FARESİZ MENÜ VE KLAVYE YÖNETİMİ
let focusedSliderIndex = 0;

function updateSliderFocusUI() {
  sliderGroups.forEach((group, idx) => {
    if (idx === focusedSliderIndex) {
      group.classList.add('focused');
    } else {
      group.classList.remove('focused');
    }
  });
}
updateSliderFocusUI();

function adjustSliderValue(index, direction) {
  const slider = sliders[index];
  const step = parseFloat(slider.step) || 1.0;
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  let val = parseFloat(slider.value);

  val += direction * step;
  if (val < min) val = min;
  if (val > max) val = max;

  slider.value = val;
  slider.dispatchEvent(new Event('input', { bubbles: true }));
}

// Slider Değer Dinleyicileri
sliders[0].addEventListener('input', (e) => {
  rho = parseFloat(e.target.value);
  chaosVal.textContent = rho.toFixed(1);
});

sliders[1].addEventListener('input', (e) => {
  windForce = parseFloat(e.target.value);
  windVal.textContent = windForce > 0 ? `+${windForce.toFixed(0)}` : windForce.toFixed(0);
});

sliders[2].addEventListener('input', (e) => {
  simSpeed = parseFloat(e.target.value);
  speedVal.textContent = `${simSpeed.toFixed(1)}x`;
});

sliderGroups.forEach((group, idx) => {
  group.addEventListener('click', () => {
    focusedSliderIndex = idx;
    updateSliderFocusUI();
  });
});

// Klavye Olayları: WASD (Karakter), Ok Tuşları (Sliderlar), Space (Antigrav), Shift (Dash), P (Fotoğraf)
window.addEventListener('keydown', (e) => {
  initAudio();

  // Tarayıcı kaydırmasını engelle
  const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'ShiftRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyP'];
  if (navKeys.includes(e.code) || e.key === ' ' || e.key === 'Shift' || e.key === 'p' || e.key === 'P') {
    e.preventDefault();
  }

  // 1. AKTİF KARAKTER HAREKETİ (W, A, S, D)
  if (e.code === 'KeyW') { moveKeys.w = true; return; }
  if (e.code === 'KeyS') { moveKeys.s = true; return; }
  if (e.code === 'KeyA') { moveKeys.a = true; return; }
  if (e.code === 'KeyD') { moveKeys.d = true; return; }

  // 2. SLIDER MENÜ NAVİGASYONU (SADECE OK / ARROW TUŞLARI)
  if (e.code === 'ArrowUp') {
    focusedSliderIndex = (focusedSliderIndex - 1 + sliders.length) % sliders.length;
    updateSliderFocusUI();
    return;
  }
  if (e.code === 'ArrowDown') {
    focusedSliderIndex = (focusedSliderIndex + 1) % sliders.length;
    updateSliderFocusUI();
    return;
  }
  if (e.code === 'ArrowLeft') {
    adjustSliderValue(focusedSliderIndex, -1);
    return;
  }
  if (e.code === 'ArrowRight') {
    adjustSliderValue(focusedSliderIndex, 1);
    return;
  }

  // 3. ANTIGRAVITY (Space)
  if (e.code === 'Space') {
    if (!keyboardSpace && !btnSpace) playAntigravitySound();
    keyboardSpace = true;
    antigravityBtn.classList.add('active');
    return;
  }

  // 4. DASH (Shift)
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift') {
    triggerDash();
    return;
  }

  // 5. GENERATIVE ART EKRAN GÖRÜNTÜSÜ / FOTOĞRAF ÇEK (P Tuşu)
  if (e.code === 'KeyP') {
    captureScreenshot();
    return;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') { moveKeys.w = false; }
  if (e.code === 'KeyS') { moveKeys.s = false; }
  if (e.code === 'KeyA') { moveKeys.a = false; }
  if (e.code === 'KeyD') { moveKeys.d = false; }

  if (e.code === 'Space') {
    keyboardSpace = false;
    if (!btnSpace) antigravityBtn.classList.remove('active');
    e.preventDefault();
  }
});

// Fare ve Dokunmatik Antigravity Butonu
antigravityBtn.addEventListener('mousedown', () => {
  initAudio();
  if (!keyboardSpace && !btnSpace) playAntigravitySound();
  btnSpace = true;
  antigravityBtn.classList.add('active');
});

window.addEventListener('mouseup', () => {
  if (btnSpace) {
    btnSpace = false;
    if (!keyboardSpace) antigravityBtn.classList.remove('active');
  }
});

antigravityBtn.addEventListener('touchstart', (e) => {
  initAudio();
  if (!keyboardSpace && !btnSpace) playAntigravitySound();
  btnSpace = true;
  antigravityBtn.classList.add('active');
  e.preventDefault();
}, { passive: false });

window.addEventListener('touchend', () => {
  if (btnSpace) {
    btnSpace = false;
    if (!keyboardSpace) antigravityBtn.classList.remove('active');
  }
});

// Dash Fonksiyonu
function triggerDash() {
  if (dashCooldown > 0) return;

  initAudio();
  playDashSound();

  isDashing = true;
  dashTimer = DASH_DURATION;
  dashCooldown = DASH_COOLDOWN_MAX;
  dashBtn.classList.add('active');
  dashBanner.classList.add('active');

  let activeSpeed = Math.hypot(player_vx, player_vy);
  let dxNorm = facingDir.x;
  let dyNorm = facingDir.y;

  if (activeSpeed > 0.2) {
    dxNorm = player_vx / activeSpeed;
    dyNorm = player_vy / activeSpeed;
  } else {
    let speedMag = Math.hypot(currentVx, currentVy);
    if (speedMag > 0.4) {
      dxNorm = currentVx / speedMag;
      dyNorm = currentVy / speedMag;
    }
  }

  dashImpulse.x = dxNorm * 14.5;
  dashImpulse.y = dyNorm * 14.5;

  for (let i = 0; i < 14; i++) {
    burstParticles.push({
      x: px + (Math.random() - 0.5) * 8,
      y: py + (Math.random() - 0.5) * 8,
      vx: -dxNorm * (2 + Math.random() * 4) + (Math.random() - 0.5) * 2,
      vy: -dyNorm * (2 + Math.random() * 4) + (Math.random() - 0.5) * 2,
      color: ['#ff9e00', '#ffd166', '#c77dff', '#ffffff'][Math.floor(Math.random() * 4)],
      life: 25 + Math.floor(Math.random() * 15)
    });
  }
}

dashBtn.addEventListener('click', triggerDash);

// 📸 GENERATIVE ART FOTOĞRAF ÇEKME FONKSİYONU
let photoBannerTimeout = null;

function captureScreenshot() {
  initAudio();
  playCameraSound();

  // Bildirim rozetini göster
  photoBanner.classList.add('active');
  if (photoBannerTimeout) clearTimeout(photoBannerTimeout);
  photoBannerTimeout = setTimeout(() => {
    photoBanner.classList.remove('active');
  }, 2200);

  // Canvas görüntüsünü PNG formatında dışa aktar ve indir
  try {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `chaos_ghost_lorenz_${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Ekran görüntüsü kaydedilirken hata:', err);
  }
}

photoBtn.addEventListener('click', captureScreenshot);

// İzi Temizle Butonu
clearTrailBtn.addEventListener('click', () => {
  trail.length = 0;
});

// Sıfırla Butonu
resetBtn.addEventListener('click', () => {
  score = 0;
  scoreDisplay.textContent = '0000';
  lx = 0.1; ly = 0.0; lz = 24.0;
  px = CW / 2; py = CH / 2;
  currentVx = 0; currentVy = 0;
  player_vx = 0; player_vy = 0;
  moveKeys.w = false; moveKeys.a = false; moveKeys.s = false; moveKeys.d = false;
  dashCooldown = 0;
  trail.length = 0;
  relocateTarget();
});

// Hedef Konumlandırma
function relocateTarget() {
  const side = Math.random() > 0.5 ? 1 : -1;
  const targetLX = side * (6 + Math.random() * 13);
  const targetLZ = 12 + Math.random() * 26;

  target.x = Math.round(CW / 2 + targetLX * 5.6 + (Math.random() - 0.5) * 16);
  target.y = Math.round(CH - 26 - targetLZ * 5.4 + (Math.random() - 0.5) * 16);

  target.x = Math.max(25, Math.min(CW - 25, target.x));
  target.y = Math.max(30, Math.min(CH - 30, target.y));

  for (let i = 0; i < 7; i++) {
    burstParticles.push({
      x: target.x + (Math.random() - 0.5) * 6,
      y: target.y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      color: '#ffe494',
      life: 20
    });
  }
}

// 5. FİZİK, ÇEKİM MERKEZLERİ & DERİNLİK HESAPLAMALARI
function updatePhysics() {
  const baseDt = 0.012 * simSpeed;
  isAntigravity = keyboardSpace || btnSpace;

  // Dash Cooldown Sayacı
  if (dashCooldown > 0) {
    dashCooldown--;
    const percent = Math.min(100, Math.max(0, ((DASH_COOLDOWN_MAX - dashCooldown) / DASH_COOLDOWN_MAX) * 100));
    dashCooldownFill.style.width = percent + '%';
    dashCooldownFill.classList.remove('ready');
    dashCooldownText.textContent = `${(dashCooldown / 60).toFixed(1)}s`;
    dashCooldownText.style.color = 'var(--accent-dash)';
  } else {
    dashCooldownFill.style.width = '100%';
    dashCooldownFill.classList.add('ready');
    dashCooldownText.textContent = 'HAZIR!';
    dashCooldownText.style.color = 'var(--accent-mint)';
  }

  if (isDashing) {
    dashTimer--;
    if (dashTimer <= 0) {
      isDashing = false;
      dashBtn.classList.remove('active');
      dashBanner.classList.remove('active');
    }
  }

  // ------------------------------------------------------------------
  // KLASİK LORENZ TÜREVLERİ
  // dx/dt = sigma * (y - x) + rüzgar
  // dy/dt = x * (rho - z) - y
  // dz/dt = x * y - beta * z
  // ------------------------------------------------------------------
  let dx = sigma * (ly - lx);
  let dy = lx * (rho - lz) - ly;
  let dz = lx * ly - beta * lz;

  // ANTIGRAVITY (Ters Türev)
  if (isAntigravity) {
    dx = -dx * 1.25;
    dy = -dy * 1.25;
    dz = -dz * 1.25;
    oofBanner.classList.add('active');
    statusPill.textContent = '⚡ ANTİ-YERÇEKİMİ!';
    statusPill.style.color = 'var(--accent-mint)';
    statusPill.style.borderColor = 'var(--accent-mint)';
  } else {
    oofBanner.classList.remove('active');
    statusPill.textContent = rho > 24 ? 'DURUM: KAOTİK DÖNGÜ' : 'DURUM: PERİYODİK';
    statusPill.style.color = 'var(--accent-gold)';
    statusPill.style.borderColor = '#2f3e66';
  }

  // Rüzgar
  dx += windForce * 1.8;

  // Lorenz Faz Uzayı Entegrasyonu (Euler Adımı)
  lx += dx * baseDt;
  ly += dy * baseDt;
  lz += dz * baseDt;

  // Yumuşak sınırlar
  if (lx < -34) lx = -34;
  if (lx > 34) lx = 34;
  if (lz < 0.5) lz = 0.5;
  if (lz > 52) lz = 52;

  // Ekran koordinatları izdüşümü (320x320 kare format)
  const targetScreenX = (CW / 2) + (lx * 5.6);
  const targetScreenY = (CH - 26) - (lz * 5.4);

  // ------------------------------------------------------------------
  // 1. Z-EKSENİ DERİNLİĞİ (BOYUT YANILSAMASI: 1x, 2x, 3x ÖLÇEĞİ)
  // ------------------------------------------------------------------
  zDepthDisplay.textContent = lz.toFixed(1);

  if (lz < 18) {
    currentScale = 1; // Uzak (Minik: 8x8 piksel)
    scaleDisplay.textContent = '1x (UZAK)';
    scaleDisplay.style.color = '#8b9bb4';
  } else if (lz <= 34) {
    currentScale = 2; // Orta (Standart: 16x16 piksel)
    scaleDisplay.textContent = '2x (ORTA)';
    scaleDisplay.style.color = 'var(--accent-gold)';
  } else {
    currentScale = 3; // Yakın (Devasa: 24x24 piksel)
    scaleDisplay.textContent = '3x (YAKIN)';
    scaleDisplay.style.color = 'var(--accent-pink)';
  }

  // ------------------------------------------------------------------
  // 2. KELEBEĞİN KANATLARI (DİNAMİK BÖLGE TESPİTİ)
  // ------------------------------------------------------------------
  let activeWing = 'center';
  if (lx < -0.8) {
    activeWing = 'left';
    wingDisplay.textContent = 'BÖLGE: SOL KANAT';
    wingDisplay.className = 'wing-status-badge left';
  } else if (lx > 0.8) {
    activeWing = 'right';
    wingDisplay.textContent = 'BÖLGE: SAĞ KANAT';
    wingDisplay.className = 'wing-status-badge right';
  } else {
    activeWing = 'center';
    wingDisplay.textContent = 'BÖLGE: MERKEZ GEÇİŞ';
    wingDisplay.className = 'wing-status-badge center';
  }

  // ------------------------------------------------------------------
  // 3. AKTİF OYUNCU HAREKETİ (AKINTIYA KARŞI YÜZME)
  // ------------------------------------------------------------------
  let ax = 0;
  let ay = 0;
  if (moveKeys.w) ay -= player_accel;
  if (moveKeys.s) ay += player_accel;
  if (moveKeys.a) ax -= player_accel;
  if (moveKeys.d) ax += player_accel;

  if (ax !== 0 && ay !== 0) {
    ax *= 0.7071;
    ay *= 0.7071;
  }

  player_vx += ax;
  player_vy += ay;

  if (!moveKeys.a && !moveKeys.d) player_vx *= player_friction;
  if (!moveKeys.w && !moveKeys.s) player_vy *= player_friction;

  const activeSwimSpeed = Math.hypot(player_vx, player_vy);
  if (activeSwimSpeed > player_max_speed) {
    player_vx = (player_vx / activeSwimSpeed) * player_max_speed;
    player_vy = (player_vy / activeSwimSpeed) * player_max_speed;
  }

  // ------------------------------------------------------------------
  // 4. ÇEKİM MERKEZLERİ (KARA DELİK / GRAVITY WELL ETKİSİ)
  // ------------------------------------------------------------------
  // Lorenz denge noktaları: C1=(-xc, zc), C2=(+xc, zc)
  let xc = 0;
  let zc = 0;
  if (rho > 1) {
    xc = Math.sqrt(beta * (rho - 1));
    zc = rho - 1;
  }
  const c1ScreenX = (CW / 2) - (xc * 5.6);
  const c1ScreenY = (CH - 26) - (zc * 5.4);
  const c2ScreenX = (CW / 2) + (xc * 5.6);
  const c2ScreenY = (CH - 26) - (zc * 5.4);

  // İki merkeze olan mesafeler
  const dist1 = Math.hypot(px - c1ScreenX, py - c1ScreenY);
  const dist2 = Math.hypot(px - c2ScreenX, py - c2ScreenY);

  const nearestDist = Math.min(dist1, dist2);
  const nearestTargetX = dist1 < dist2 ? c1ScreenX : c2ScreenX;
  const nearestTargetY = dist1 < dist2 ? c1ScreenY : c2ScreenY;

  let gravityWellPullX = 0;
  let gravityWellPullY = 0;

  // Kara delik çekim alanı (50 piksel yarıçap)
  if (nearestDist < 50) {
    const pullMagnitude = (38.0 / (nearestDist + 6.0));
    const pullDirX = (nearestTargetX - px) / nearestDist;
    const pullDirY = (nearestTargetY - py) / nearestDist;

    if (isAntigravity) {
      // Space basıldığında kara delik iticiye dönüşür (repeller)
      gravityWellPullX = -pullDirX * pullMagnitude * 1.6;
      gravityWellPullY = -pullDirY * pullMagnitude * 1.6;
    } else {
      // Normal modda merkeze çeker
      gravityWellPullX = pullDirX * pullMagnitude;
      gravityWellPullY = pullDirY * pullMagnitude;
    }

    if (nearestDist < 26 && !isAntigravity && !isDashing) {
      statusPill.textContent = '⚠️ GİRDAP ÇEKİMİ!';
      statusPill.style.color = '#ff9bb2';
      statusPill.style.borderColor = '#ff4d79';
    }
  }

  // Karakter Hızını ve Takibini Hesapla
  let prevPx = px;
  let prevPy = py;

  if (isDashing) {
    px += dashImpulse.x;
    py += dashImpulse.y;
    dashImpulse.x *= 0.90;
    dashImpulse.y *= 0.90;
  } else {
    // Toplam Hareket = Kaos Akıntısı + Oyuncu Hızı + Kara Delik Çekimi
    const chaosDriftX = (targetScreenX - px) * 0.32;
    const chaosDriftY = (targetScreenY - py) * 0.32;

    px += chaosDriftX + player_vx + gravityWellPullX;
    py += chaosDriftY + player_vy + gravityWellPullY;
  }

  currentVx = px - prevPx;
  currentVy = py - prevPy;
  if (Math.abs(currentVx) > 0.1 || Math.abs(currentVy) > 0.1) {
    facingDir.x = currentVx >= 0 ? 1 : -1;
    facingDir.y = currentVy >= 0 ? 1 : -1;
  }

  // Ekran sınırlarını koru
  px = Math.max(10, Math.min(CW - 10, px));
  py = Math.max(10, Math.min(CH - 10, py));

  // ------------------------------------------------------------------
  // 5. GENERATIVE ART YÖRÜNGE İZİ (Yavaş Silinen 1200+ İzi)
  // ------------------------------------------------------------------
  trail.push({
    x: Math.round(px),
    y: Math.round(py),
    scale: currentScale,
    wing: activeWing,
    isAnti: isAntigravity,
    isDash: isDashing
  });
  if (trail.length > MAX_TRAIL) {
    trail.shift();
  }

  // Hedef Toplama Kontrolü
  const distTargetSq = (px - target.x) * (px - target.x) + (py - target.y) * (py - target.y);
  if (distTargetSq < (12 + currentScale * 3) * (12 + currentScale * 3)) {
    score += 1;
    scoreDisplay.textContent = String(score).padStart(4, '0');
    if (score > highScore) {
      highScore = score;
      highScoreDisplay.textContent = String(highScore).padStart(4, '0');
      localStorage.setItem('chaosGhostHighScore', String(highScore));
    }

    playCollectSound();

    floatingScores.push({
      x: Math.round(target.x) - 5,
      y: Math.round(target.y) - 6,
      life: 45
    });

    for (let i = 0; i < 12; i++) {
      burstParticles.push({
        x: target.x + (Math.random() - 0.5) * 6,
        y: target.y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 - 1,
        color: ['#ffd166', '#ffb703', '#ffffff', '#5bf5cc', '#ff7597'][Math.floor(Math.random() * 5)],
        life: 25 + Math.floor(Math.random() * 15)
      });
    }

    relocateTarget();
  }

  for (let i = floatingScores.length - 1; i >= 0; i--) {
    const fs = floatingScores[i];
    fs.y -= 0.6;
    fs.life -= 1;
    if (fs.life <= 0) floatingScores.splice(i, 1);
  }

  for (let i = burstParticles.length - 1; i >= 0; i--) {
    const bp = burstParticles[i];
    bp.x += bp.vx;
    bp.y += bp.vy;
    bp.vy += 0.08;
    bp.life -= 1;
    if (bp.life <= 0) burstParticles.splice(i, 1);
  }
}

// 6. ÇİZİM FONKSİYONLARI (%100 fillRect, SIFIR arc())
let tickCount = 0;

function drawBackground() {
  tickCount++;

  // Derin lacivert uzay tabanı
  ctx.fillStyle = '#0b101d';
  ctx.fillRect(0, 0, CW, CH);

  // Retro 8-bit Koordinat Izgarası
  ctx.fillStyle = '#10172b';
  for (let gx = 0; gx < CW; gx += 20) {
    ctx.fillRect(gx, 0, 1, CH);
  }
  for (let gy = 0; gy < CH; gy += 20) {
    ctx.fillRect(0, gy, CW, 1);
  }

  // Minik Yanıp Sönen Gece Gökyüzü Piksel Yıldızları
  for (let i = 0; i < bgStars.length; i++) {
    const star = bgStars[i];
    const isBlinking = ((tickCount + star.phase) % star.blinkPeriod) < 8;
    if (!isBlinking) {
      ctx.fillStyle = star.color;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
  }

  // ------------------------------------------------------------------
  // ÇEKİM MERKEZLERİ (KARA DELİK GİRDAPLARI / LORENZ DENGE NOKTALARI)
  // ------------------------------------------------------------------
  if (rho > 1) {
    const xc = Math.sqrt(beta * (rho - 1));
    const zc = rho - 1;
    const c1X = Math.floor((CW / 2) - (xc * 5.6));
    const c1Y = Math.floor((CH - 26) - (zc * 5.4));
    const c2X = Math.floor((CW / 2) + (xc * 5.6));
    const c2Y = Math.floor((CH - 26) - (zc * 5.4));

    // Dönen Pikselli Girdap Çizimi (Sıfır arc, %100 fillRect)
    drawVortexHole(c1X, c1Y, '#ff7597');
    drawVortexHole(c2X, c2Y, '#5bf5cc');
  }
}

// Kara Delik Girdap Çizici (8-bit Dönen Piksel Sarmalı)
function drawVortexHole(cx, cy, color) {
  const pulse = Math.floor((tickCount / 6) % 4);
  
  // Dış çekim aurası
  ctx.fillStyle = '#141d33';
  ctx.fillRect(cx - 5, cy - 5, 11, 11);

  // İç dönen girdap halkası
  ctx.fillStyle = color;
  if (pulse === 0) {
    ctx.fillRect(cx - 3, cy - 3, 2, 2);
    ctx.fillRect(cx + 2, cy - 3, 2, 2);
    ctx.fillRect(cx + 2, cy + 2, 2, 2);
    ctx.fillRect(cx - 3, cy + 2, 2, 2);
  } else if (pulse === 1) {
    ctx.fillRect(cx - 4, cy - 1, 2, 2);
    ctx.fillRect(cx - 1, cy - 4, 2, 2);
    ctx.fillRect(cx + 3, cy - 1, 2, 2);
    ctx.fillRect(cx - 1, cy + 3, 2, 2);
  } else if (pulse === 2) {
    ctx.fillRect(cx - 2, cy - 2, 5, 1);
    ctx.fillRect(cx - 2, cy + 2, 5, 1);
    ctx.fillRect(cx - 2, cy - 2, 1, 5);
    ctx.fillRect(cx + 2, cy - 2, 1, 5);
  } else {
    ctx.fillRect(cx - 1, cy - 3, 2, 2);
    ctx.fillRect(cx + 2, cy - 1, 2, 2);
    ctx.fillRect(cx - 1, cy + 2, 2, 2);
    ctx.fillRect(cx - 3, cy - 1, 2, 2);
  }

  // Merkez tekillik (Siyah pikselli çekirdek)
  ctx.fillStyle = '#050811';
  ctx.fillRect(cx - 1, cy - 1, 3, 3);
}

// Generative Art İzi (1200+ Yavaş Silinen Nokta - Pastel Kanat Renkleri)
function drawTrail() {
  const len = trail.length;
  for (let i = 0; i < len; i++) {
    const t = trail[i];
    const progress = i / len; // 0: en eski, 1: en yeni
    
    let trailColor;
    let size = progress > 0.75 ? 3 : (progress > 0.35 ? 2 : 1);

    if (t.isDash) {
      trailColor = progress > 0.6 ? '#ff9e00' : (progress > 0.3 ? '#c77dff' : '#6a2a9e');
      size += 1;
    } else if (t.isAnti) {
      trailColor = progress > 0.6 ? '#ffe494' : (progress > 0.3 ? '#ffd166' : '#d49b28');
    } else if (t.wing === 'left') {
      // Sol Kanat: Pastel Pembe Degrade
      trailColor = progress > 0.7 ? '#ff7597' : (progress > 0.4 ? '#c95475' : '#662438');
    } else if (t.wing === 'right') {
      // Sağ Kanat: Pastel Nane Yeşili Degrade
      trailColor = progress > 0.7 ? '#5bf5cc' : (progress > 0.4 ? '#38a88a' : '#175444');
    } else {
      // Merkez: Pastel Leylak
      trailColor = progress > 0.7 ? '#c77dff' : (progress > 0.4 ? '#8a52b8' : '#3d1d59');
    }

    ctx.fillStyle = trailColor;
    ctx.fillRect(Math.floor(t.x - size / 2), Math.floor(t.y - size / 2), size, size);
  }
}

// Hedef Yıldız (7x7 Bloklu Aseprite Tarzı)
function drawTargetStar() {
  const tx = Math.floor(target.x);
  const ty = Math.floor(target.y);
  const pulse = Math.floor((tickCount / 10) % 2);

  const starPattern = [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 1, 2, 3, 2, 1, 0],
    [0, 2, 2, 3, 2, 2, 0],
    [1, 3, 3, 3, 3, 3, 1],
    [0, 2, 2, 3, 2, 2, 0],
    [0, 1, 2, 3, 2, 1, 0],
    [0, 0, 0, 1, 0, 0, 0]
  ];

  const blockSize = 2;
  const offsetX = tx - 7;
  const offsetY = ty - 7 + pulse;

  // Işıltı pikselleri
  ctx.fillStyle = '#ffeaa7';
  if (pulse === 1) {
    ctx.fillRect(offsetX - 2, offsetY + 6, 2, 2);
    ctx.fillRect(offsetX + 14, offsetY + 6, 2, 2);
    ctx.fillRect(offsetX + 6, offsetY - 2, 2, 2);
    ctx.fillRect(offsetX + 6, offsetY + 14, 2, 2);
  }

  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const val = starPattern[r][c];
      if (val === 0) continue;

      if (val === 1) ctx.fillStyle = '#ffb703';
      else if (val === 2) ctx.fillStyle = '#ffd166';
      else if (val === 3) ctx.fillStyle = '#ffffff';

      ctx.fillRect(offsetX + c * blockSize, offsetY + r * blockSize, blockSize, blockSize);
    }
  }
}

// Oyuncu Karakteri (Z-Ekseni Derinlik Ölçeği ve Kanat Renkleri ile)
function drawPlayerGhost() {
  const pSize = currentScale; // Z derinliğine bağlı blok boyutu: 1, 2, veya 3!
  const halfSize = 4 * pSize;
  const gx = Math.floor(px) - halfSize;
  const gy = Math.floor(py) - halfSize;
  const bob = Math.floor((tickCount / 8) % 2);

  let bodyMain, bodyShade, blushColor, eyeColor, eyeShine;

  // Kanat ve Durum Renkleri
  if (isDashing) {
    bodyMain = '#ff9e00';
    bodyShade = '#cc7a00';
    blushColor = '#ffffff';
    eyeColor = '#210d00';
    eyeShine = '#ffffff';
  } else if (isAntigravity) {
    bodyMain = '#ffe494';
    bodyShade = '#ffd166';
    blushColor = '#ff7597';
    eyeColor = '#211500';
    eyeShine = '#ffffff';
  } else if (lx < -0.8) {
    // SOL KANAT: Tatlış Pastel Pembe
    bodyMain = '#ff7597';
    bodyShade = '#e65377';
    blushColor = '#ff3366';
    eyeColor = '#240813';
    eyeShine = '#ffffff';
  } else if (lx > 0.8) {
    // SAĞ KANAT: Tatlış Pastel Nane Yeşili
    bodyMain = '#5bf5cc';
    bodyShade = '#3bd1a9';
    blushColor = '#1fb38d';
    eyeColor = '#062b20';
    eyeShine = '#ffffff';
  } else {
    // MERKEZ: Pastel Leylak
    bodyMain = '#c77dff';
    bodyShade = '#a552e6';
    blushColor = '#e388ff';
    eyeColor = '#1e0730';
    eyeShine = '#ffffff';
  }

  let sprite;
  if (isDashing) {
    sprite = [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 3, 1, 1, 3, 1, 1],
      [1, 3, 1, 3, 3, 1, 3, 1],
      [1, 5, 1, 1, 1, 1, 5, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 1, 2, 2, 1, 2, 1],
      [1, 0, 0, 1, 1, 0, 0, 1]
    ];
  } else if (isAntigravity) {
    sprite = [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 3, 1, 1, 3, 1, 1],
      [1, 3, 1, 3, 3, 1, 3, 1],
      [1, 5, 1, 1, 1, 1, 5, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 1, 2, 2, 1, 2, 1],
      [1, 0, 1, 0, 0, 1, 0, 1]
    ];
  } else {
    sprite = [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 3, 4, 1, 3, 4, 1],
      [1, 1, 3, 3, 1, 3, 3, 1],
      [1, 5, 1, 1, 1, 1, 5, 1],
      [1, 1, 1, 2, 2, 1, 1, 1],
      [1, 2, 1, 2, 2, 1, 2, 1],
      bob === 0 
        ? [1, 0, 1, 0, 0, 1, 0, 1] 
        : [0, 1, 0, 1, 1, 0, 1, 0]
    ];
  }

  // Sprite'ı fillRect ile derinlik ölçeğinde (pSize) çiz
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const type = sprite[r][c];
      if (type === 0) continue;

      if (type === 1) ctx.fillStyle = bodyMain;
      else if (type === 2) ctx.fillStyle = bodyShade;
      else if (type === 3) ctx.fillStyle = eyeColor;
      else if (type === 4) ctx.fillStyle = eyeShine;
      else if (type === 5) ctx.fillStyle = blushColor;

      ctx.fillRect(gx + c * pSize, gy + r * pSize, pSize, pSize);
    }
  }

  // Kıvılcım Efektleri
  if (isDashing) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gx - 4 * pSize, gy + 2 * pSize, 2 * pSize, pSize);
    ctx.fillRect(gx - 5 * pSize, gy + 4 * pSize, 3 * pSize, pSize);
  } else if (isAntigravity) {
    ctx.fillStyle = '#ffffff';
    const sparkleOffset = (tickCount % 6) * pSize;
    ctx.fillRect(gx - 2 * pSize + sparkleOffset, gy - 2 * pSize, pSize, pSize);
    ctx.fillRect(gx + 9 * pSize - sparkleOffset, gy + 8 * pSize, pSize, pSize);
  }
}

// Konfetiler ve Yükselen "+1"
function drawParticlesAndFloaters() {
  for (let i = 0; i < burstParticles.length; i++) {
    const bp = burstParticles[i];
    ctx.fillStyle = bp.color;
    ctx.fillRect(Math.floor(bp.x), Math.floor(bp.y), 2, 2);
  }

  for (let i = 0; i < floatingScores.length; i++) {
    const fs = floatingScores[i];
    const fx = Math.floor(fs.x);
    const fy = Math.floor(fs.y);
    const b = 2;

    ctx.fillStyle = '#070a14';
    ctx.fillRect(fx + 2 * b + 1, fy + 1, b, 5 * b);
    ctx.fillRect(fx + 1, fy + 2 * b + 1, 5 * b, b);
    ctx.fillRect(fx + 7 * b + 1, fy + 1, b, 5 * b);
    ctx.fillRect(fx + 6 * b + 1, fy + 1, b, b);
    ctx.fillRect(fx + 6 * b + 1, fy + 4 * b + 1, 3 * b, b);

    ctx.fillStyle = fs.life > 20 ? '#ffe082' : (fs.life > 8 ? '#ffd166' : '#ffffff');
    ctx.fillRect(fx + 2 * b, fy, b, 5 * b);
    ctx.fillRect(fx, fy + 2 * b, 5 * b, b);
    ctx.fillRect(fx + 6 * b, fy, b, b);
    ctx.fillRect(fx + 7 * b, fy, b, 5 * b);
    ctx.fillRect(fx + 6 * b, fy + 4 * b, 3 * b, b);
  }
}

// 7. ANA OYUN DÖNGÜSÜ
function gameLoop() {
  updatePhysics();
  drawBackground();
  drawTrail();
  drawTargetStar();
  drawPlayerGhost();
  drawParticlesAndFloaters();

  requestAnimationFrame(gameLoop);
}

// Başlat
relocateTarget();
requestAnimationFrame(gameLoop);
