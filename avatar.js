// ============================================================
// AVATAR SYSTEM \u2014 Quest Board
// Mix-and-match avatar creator with Zelda, sea animals, MJ themes
// Draws to <canvas> using emoji + layered rendering
// ============================================================

const AVATAR_CATEGORIES = [
  { id: 'bg',      label: 'Background' },
  { id: 'body',    label: 'Body' },
  { id: 'face',    label: 'Face' },
  { id: 'head',    label: 'Head' },
  { id: 'extra',   label: 'Extra' },
];

const AVATAR_ITEMS = {
  bg: [
    { id: 'bg_forest',  emoji: '\uD83C\uDF32', label: 'Forest' },
    { id: 'bg_ocean',   emoji: '\uD83C\uDF0A', label: 'Ocean' },
    { id: 'bg_stars',   emoji: '\u2B50', label: 'Stars' },
    { id: 'bg_castle',  emoji: '\uD83C\uDFF0', label: 'Castle' },
    { id: 'bg_desert',  emoji: '\uD83C\uDFDC\uFE0F',  label: 'Desert' },
    { id: 'bg_rainbow', emoji: '\uD83C\uDF08', label: 'Rainbow' },
  ],
  body: [
    // Zelda themed
    { id: 'body_link',    emoji: '\uD83E\uDDDD', label: 'Elf hero' },
    { id: 'body_knight',  emoji: '\u2694\uFE0F',  label: 'Knight' },
    { id: 'body_wizard',  emoji: '\uD83E\uDDD9', label: 'Wizard' },
    // Sea animals
    { id: 'body_octopus', emoji: '\uD83D\uDC19', label: 'Octopus' },
    { id: 'body_fish',    emoji: '\uD83D\uDC20', label: 'Clownfish' },
    { id: 'body_shark',   emoji: '\uD83E\uDD88', label: 'Shark' },
    { id: 'body_turtle',  emoji: '\uD83D\uDC22', label: 'Turtle' },
    { id: 'body_whale',   emoji: '\uD83D\uDC0B', label: 'Whale' },
    { id: 'body_crab',    emoji: '\uD83E\uDD80', label: 'Crab' },
    { id: 'body_dolph',   emoji: '\uD83D\uDC2C', label: 'Dolphin' },
    // MJ / performer
    { id: 'body_dancer',  emoji: '\uD83D\uDD7A', label: 'Dancer' },
    { id: 'body_star',    emoji: '\uD83C\uDF1F', label: 'Pop star' },
    { id: 'body_robot',   emoji: '\uD83E\uDD16', label: 'Robot' },
    { id: 'body_ninja',   emoji: '\uD83E\uDD77', label: 'Ninja' },
  ],
  face: [
    { id: 'face_happy',   emoji: '\uD83D\uDE04', label: 'Happy' },
    { id: 'face_cool',    emoji: '\uD83D\uDE0E', label: 'Cool' },
    { id: 'face_fierce',  emoji: '\uD83D\uDE24', label: 'Fierce' },
    { id: 'face_silly',   emoji: '\uD83E\uDD2A', label: 'Silly' },
    { id: 'face_wink',    emoji: '\uD83D\uDE09', label: 'Wink' },
    { id: 'face_fire',    emoji: '\uD83E\uDD29', label: 'Superstar' },
    { id: 'face_mask',    emoji: '\uD83C\uDFAD', label: 'Mystery' },
    { id: 'face_alien',   emoji: '\uD83D\uDC7D', label: 'Alien' },
  ],
  head: [
    // Zelda
    { id: 'head_hat',     emoji: '\uD83C\uDFA9', label: 'Top hat' },
    { id: 'head_cap',     emoji: '\uD83E\uDDE2', label: 'Cap' },
    { id: 'head_crown',   emoji: '\uD83D\uDC51', label: 'Crown' },
    { id: 'head_helmet',  emoji: '\u26D1\uFE0F',  label: 'Helmet' },
    { id: 'head_wizard',  emoji: '\uD83E\uDE84', label: 'Magic wand' },
    // MJ
    { id: 'head_fedora',  emoji: '\uD83C\uDFA9', label: 'Fedora' },
    { id: 'head_sparkle', emoji: '\u2728', label: 'Sparkles' },
    // Sea
    { id: 'head_seaweed', emoji: '\uD83C\uDF3F', label: 'Seaweed' },
    { id: 'head_shell',   emoji: '\uD83D\uDC1A', label: 'Shell' },
    { id: 'head_anchor',  emoji: '\u2693', label: 'Anchor' },
  ],
  extra: [
    // Zelda weapons / items
    { id: 'ex_sword',    emoji: '\uD83D\uDDE1\uFE0F',  label: 'Sword' },
    { id: 'ex_shield',   emoji: '\uD83D\uDEE1\uFE0F',  label: 'Shield' },
    { id: 'ex_bow',      emoji: '\uD83C\uDFF9', label: 'Bow' },
    { id: 'ex_triforce', emoji: '\uD83D\uDD3A', label: 'Triforce' },
    // MJ
    { id: 'ex_glove',    emoji: '\uD83E\uDDE4', label: 'Glove' },
    { id: 'ex_music',    emoji: '\uD83C\uDFB5', label: 'Music note' },
    { id: 'ex_mic',      emoji: '\uD83C\uDFA4', label: 'Mic' },
    // Sea
    { id: 'ex_wave',     emoji: '\uD83C\uDF0A', label: 'Wave' },
    { id: 'ex_fish',     emoji: '\uD83D\uDC1F', label: 'Sidekick fish' },
    { id: 'ex_bubble',   emoji: '\uD83E\uDEE7', label: 'Bubbles' },
    // General
    { id: 'ex_lightning',emoji: '\u26A1', label: 'Lightning' },
    { id: 'ex_heart',    emoji: '\u2764\uFE0F',  label: 'Heart' },
    { id: 'ex_gem',      emoji: '\uD83D\uDC8E', label: 'Gem' },
    { id: 'ex_none',     emoji: null, label: 'None', isNone: true },
  ],
};

const AVATAR_COLORS = [
  '#E1F5EE', '#B5D4F4', '#FAC775', '#F0EBFF',
  '#FBEAF0', '#EAF3DE', '#FFF3DC', '#F7F5F0',
  '#FFE4E1', '#E6F0FF',
];

const DEFAULT_AVATAR = {
  bg:    'bg_stars',
  body:  'body_link',
  face:  'face_happy',
  head:  'head_crown',
  extra: 'ex_sword',
  color: '#E1F5EE',
};

// ---- Render avatar to canvas ----
function drawAvatar(canvas, config) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background circle
  ctx.beginPath();
  ctx.arc(w/2, h/2, w/2, 0, Math.PI*2);
  ctx.fillStyle = config.color || '#E1F5EE';
  ctx.fill();

  // Clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(w/2, h/2, w/2, 0, Math.PI*2);
  ctx.clip();

  const scale = w / 100;
  ctx.font = `${44 * scale}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Layer order: bg emoji (small, top-left), body (center), face overlay, head (top), extra (bottom-right)
  const layers = [
    { key: 'bg',    x: 0.2, y: 0.2, size: 0.25 },
    { key: 'body',  x: 0.5, y: 0.55, size: 0.45 },
    { key: 'face',  x: 0.5, y: 0.42, size: 0.28 },
    { key: 'head',  x: 0.5, y: 0.15, size: 0.28 },
    { key: 'extra', x: 0.78, y: 0.75, size: 0.26 },
  ];

  layers.forEach(layer => {
    const itemId = config[layer.key];
    if (!itemId) return;
    const items = AVATAR_ITEMS[layer.key];
    const item = items && items.find(i => i.id === itemId);
    if (!item || item.isNone || !item.emoji) return;

    const fontSize = layer.size * w;
    ctx.font = `${fontSize}px serif`;
    ctx.fillText(item.emoji, layer.x * w, layer.y * h);
  });

  ctx.restore();
}

// ---- Avatar Editor State ----
let editorConfig = null;
let editorChildIdx = null;
let editorCurrentCat = 'bg';

function openAvatarEditor(childIdx) {
  editorChildIdx = childIdx;
  const child = state.children[childIdx];
  editorConfig = Object.assign({}, DEFAULT_AVATAR, child.avatar || {});
  editorCurrentCat = 'bg';

  renderEditorCategoryTabs();
  renderEditorItems();
  renderEditorColors();
  drawAvatar(document.getElementById('avatar-editor-canvas'), editorConfig);

  openModal('modal-avatar');
}

function renderEditorCategoryTabs() {
  const wrap = document.getElementById('avatar-cat-tabs');
  wrap.innerHTML = AVATAR_CATEGORIES.map(cat => `
    <button class="acat-btn${cat.id === editorCurrentCat ? ' active' : ''}"
      onclick="switchAvatarCat('${cat.id}')">
      ${cat.label}
    </button>
  `).join('');
}

function switchAvatarCat(catId) {
  editorCurrentCat = catId;
  renderEditorCategoryTabs();
  renderEditorItems();
}

function renderEditorItems() {
  const items = AVATAR_ITEMS[editorCurrentCat] || [];
  const current = editorConfig[editorCurrentCat];
  const wrap = document.getElementById('avatar-items-grid');
  wrap.innerHTML = items.map(item => `
    <button class="avitem${item.id === current ? ' selected' : ''}${item.isNone ? ' none-opt' : ''}"
      onclick="selectAvatarItem('${item.id}')">
      ${item.emoji ? item.emoji : 'None'}
    </button>
  `).join('');
}

function selectAvatarItem(itemId) {
  editorConfig[editorCurrentCat] = itemId;
  renderEditorItems();
  drawAvatar(document.getElementById('avatar-editor-canvas'), editorConfig);
}

function renderEditorColors() {
  const wrap = document.getElementById('avatar-colors');
  wrap.innerHTML = AVATAR_COLORS.map(color => `
    <div class="color-swatch${editorConfig.color === color ? ' selected' : ''}"
      style="background:${color}"
      onclick="selectAvatarColor('${color}')">
    </div>
  `).join('');
}

function selectAvatarColor(color) {
  editorConfig.color = color;
  renderEditorColors();
  drawAvatar(document.getElementById('avatar-editor-canvas'), editorConfig);
}

function saveAvatar() {
  if (editorChildIdx === null) return;
  state.children[editorChildIdx].avatar = Object.assign({}, editorConfig);
  persist();
  renderAll();
  closeModal();
  showToast('Avatar saved! Looking great! \u2728');
}
