// ============================================================
// DATA PERSISTENCE \u2014 Quest Board
// GitHub Contents API \u2014 reads/writes data.json in your repo
// Falls back to localStorage if not configured
// ============================================================

let GH_TOKEN = null;   // Personal Access Token
let GH_REPO  = null;   // e.g. "yourusername/questboard"
let GH_SHA   = null;   // current SHA of data.json (needed for updates)
let USE_LOCAL = false;
let SAVE_TIMEOUT = null;
let SAVE_INDICATOR = null;

const GH_DATA_PATH = 'data.json';
const GH_API = 'https://api.github.com';

// ============================================================
// SETUP \u2014 called from the setup screen
// ============================================================

function loadConfig() {
  const saved = localStorage.getItem('qb_gh_config');
  if (saved) {
    try {
      const cfg = JSON.parse(saved);
      GH_TOKEN = cfg.token;
      GH_REPO  = cfg.repo;
      return true;
    } catch(e) {}
  }
  return false;
}

async function saveGitHubConfig() {
  const token = document.getElementById('setup-token').value.trim();
  const repo  = document.getElementById('setup-repo').value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');

  const errEl = document.getElementById('setup-error');
  const btnEl = document.getElementById('setup-connect-btn');

  if (!token) { errEl.textContent = 'Please enter your Personal Access Token'; return; }
  if (!repo || !repo.includes('/')) { errEl.textContent = 'Repo should be in the format username/reponame'; return; }

  GH_TOKEN = token;
  GH_REPO  = repo;

  btnEl.textContent = 'Connecting...';
  btnEl.disabled = true;
  errEl.textContent = '';

  try {
    const data = await fetchFromGitHub();
    state = mergeState(data);
    localStorage.setItem('qb_gh_config', JSON.stringify({ token, repo }));
    showMainApp();
  } catch(e) {
    if (e.message === 'NOT_FOUND') {
      // data.json doesn't exist yet \u2014 create it with defaults
      try {
        state = defaultState();
        await pushToGitHub(stateForStorage(), 'Quest Board: initialise data');
        localStorage.setItem('qb_gh_config', JSON.stringify({ token, repo }));
        showMainApp();
      } catch(e2) {
        errEl.textContent = 'Could not write to repo. Check your token has repo write access.';
        console.error(e2);
      }
    } else if (e.message === 'UNAUTHORIZED') {
      errEl.textContent = 'Token rejected \u2014 make sure it has "repo" scope.';
    } else {
      errEl.textContent = `Connection failed: ${e.message}`;
      console.error(e);
    }
    btnEl.textContent = 'Connect & Start \u2192';
    btnEl.disabled = false;
  }
}

function useLocalStorage() {
  USE_LOCAL = true;
  localStorage.setItem('qb_use_local', '1');
  const saved = localStorage.getItem('qb_state');
  if (saved) {
    try { state = mergeState(JSON.parse(saved)); } catch(e) { state = defaultState(); }
  } else {
    state = defaultState();
  }
  showMainApp();
}

// ============================================================
// GITHUB API
// ============================================================

async function ghFetch(path, options = {}) {
  const res = await fetch(`${GH_API}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GH_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body}`);
  }
  return res.json();
}

async function fetchFromGitHub() {
  const result = await ghFetch(`/repos/${GH_REPO}/contents/${GH_DATA_PATH}`);
  // result.content is base64-encoded
  GH_SHA = result.sha;
  const decoded = atob(result.content.replace(/\n/g, ''));
  return JSON.parse(decoded);
}

async function pushToGitHub(data, message = 'Quest Board: save data') {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
  const body = { message, content };
  if (GH_SHA) body.sha = GH_SHA; // required for updates, omit for first create

  const result = await ghFetch(`/repos/${GH_REPO}/contents/${GH_DATA_PATH}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  GH_SHA = result.content.sha; // update SHA for next save
}

// ============================================================
// PERSIST (debounced, with save indicator)
// ============================================================

function persist() {
  if (SAVE_TIMEOUT) clearTimeout(SAVE_TIMEOUT);
  setSaveIndicator('saving');
  SAVE_TIMEOUT = setTimeout(async () => {
    const toSave = stateForStorage();
    if (USE_LOCAL) {
      localStorage.setItem('qb_state', JSON.stringify(toSave));
      setSaveIndicator('saved');
    } else {
      try {
        await pushToGitHub(toSave);
        setSaveIndicator('saved');
      } catch(e) {
        console.warn('GitHub save failed, writing to local fallback:', e);
        localStorage.setItem('qb_state', JSON.stringify(toSave));
        setSaveIndicator('error');
      }
    }
  }, 1200); // slightly longer debounce \u2014 GitHub API has rate limits
}

function setSaveIndicator(status) {
  const el = document.getElementById('save-indicator');
  if (!el) return;
  const map = {
    saving: { text: '\uD83D\uDCBE Saving...', color: 'var(--amber)' },
    saved:  { text: '\u2713 Saved',     color: 'var(--green)' },
    error:  { text: '\u26A0 Save failed \u2014 check connection', color: 'var(--coral)' },
  };
  const s = map[status];
  if (!s) return;
  el.textContent = s.text;
  el.style.color = s.color;
  el.style.opacity = '1';
  if (status === 'saved') setTimeout(() => { el.style.opacity = '0'; }, 2000);
}

// ============================================================
// STATE SHAPE
// ============================================================

function defaultState() {
  return {
    children: [],   // start empty \u2014 no default Jack/Liam
    tasks: [
      { id: 't1', name: 'Make the bed',    pts: 10, icon: 'bed' },
      { id: 't2', name: '15 mins reading', pts: 15, icon: 'book' },
      { id: 't3', name: 'Homework session',pts: 20, icon: 'pencil' },
      { id: 't4', name: 'Pack school bag', pts: 5,  icon: 'backpack' },
      { id: 't5', name: 'Tidy room',       pts: 10, icon: 'broom' },
    ],
    rewards: [
      { id: 'r1', name: 'Choose dinner',    icon: 'pizza',  type: 'points', cost: 50 },
      { id: 'r2', name: 'Extra screen time',icon: 'phone',  type: 'points', cost: 80 },
      { id: 'r3', name: 'Movie night pick', icon: 'film',   type: 'streak5', cost: 0 },
      { id: 'r4', name: 'Outing of choice', icon: 'beach',  type: 'streak7', cost: 0 },
    ],
    nextId: 100,
    lastResetDate: todayKey(),
  };
}

function mergeState(data) {
  const def = defaultState();
  if (!data) return def;
  return {
    children: (data.children || []).map(c => ({
      id: c.id, name: c.name, age: c.age || 8, points: c.points || 0,
      avatar: c.avatar || {},
      completedToday: c.completedToday || {},
      dailyLog: c.dailyLog || {},
      streak: c.streak || 0,
      streakDays: c.streakDays || {},
    })),
    tasks:         data.tasks    || def.tasks,
    rewards:       data.rewards  || def.rewards,
    nextId:        data.nextId   || def.nextId,
    lastResetDate: data.lastResetDate || todayKey(),
  };
}

function stateForStorage() {
  return {
    children: state.children.map(c => ({
      id: c.id, name: c.name, age: c.age, points: c.points,
      avatar: c.avatar,
      completedToday: c.completedToday,
      dailyLog: c.dailyLog,
      streak: c.streak,
      streakDays: c.streakDays,
    })),
    tasks:         state.tasks,
    rewards:       state.rewards,
    nextId:        state.nextId,
    lastResetDate: state.lastResetDate,
  };
}

function todayKey() {
  // Use local date (not UTC) — toISOString() is always UTC which
  // causes the reset to fire at the wrong time in non-UTC timezones
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ============================================================
// DAILY RESET
// ============================================================

function checkDailyReset() {
  const today = todayKey();
  if (state.lastResetDate === today) return;

  state.children.forEach(c => {
    const prevPts = Object.keys(c.completedToday || {}).reduce((sum, tid) => {
      const t = state.tasks.find(t => t.id === tid);
      return sum + (t ? t.pts : 0);
    }, 0);
    const prevCount = Object.keys(c.completedToday || {}).length;

    if (prevCount > 0) {
      c.dailyLog = c.dailyLog || {};
      c.dailyLog[state.lastResetDate] = { pts: prevPts, tasks: prevCount };
      const keys = Object.keys(c.dailyLog).sort();
      if (keys.length > 30) keys.slice(0, keys.length - 30).forEach(k => delete c.dailyLog[k]);
      c.streakDays = c.streakDays || {};
      c.streakDays[state.lastResetDate] = true;
    }
    c.streak = calcStreak(c.streakDays || {});
    c.completedToday = {};
  });

  state.lastResetDate = today;
  persist();
}

function calcStreak(streakDays) {
  if (!streakDays) return 0;
  let streak = 0;
  const d = new Date();
  d.setDate(d.getDate() - 1);
  while (streak <= 365) {
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    const key  = `${yyyy}-${mm}-${dd}`;
    if (streakDays[key]) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

// ============================================================
// STARTUP
// ============================================================

async function initStorage() {
  if (localStorage.getItem('qb_use_local') === '1') {
    USE_LOCAL = true;
    const saved = localStorage.getItem('qb_state');
    if (saved) {
      try { state = mergeState(JSON.parse(saved)); } catch(e) { state = defaultState(); }
    } else {
      state = defaultState();
    }
    return 'local';
  }

  if (loadConfig()) {
    try {
      const data = await fetchFromGitHub();
      state = mergeState(data);
      return 'github';
    } catch(e) {
      if (e.message === 'NOT_FOUND') {
        // data.json missing \u2014 first run with existing config
        state = defaultState();
        try { await pushToGitHub(stateForStorage(), 'Quest Board: initialise data'); } catch(_) {}
        return 'github';
      }
      // Network issue \u2014 fall back to local cache
      console.warn('GitHub load failed, using local cache:', e);
      USE_LOCAL = true;
      const saved = localStorage.getItem('qb_state');
      if (saved) {
        try { state = mergeState(JSON.parse(saved)); } catch(e2) { state = defaultState(); }
      } else {
        state = defaultState();
      }
      return 'local_fallback';
    }
  }

  return 'setup_needed';
}
