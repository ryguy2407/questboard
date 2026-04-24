// ============================================================
// MAIN APP \u2014 Quest Board
// ============================================================

let state = null;
let currentProfile = 0; // index into state.children, or 'parent'
let currentViewTab = 'tasks';
let currentParentTab = 'overview';
let editingTaskId = null;
let editingRewardId = null;
let currentTaskIcon = 'star';
let currentRewardIcon = 'gift';
let currentPts = 15;
let currentRewardType = 'points';

// TASK_ICON_IDS and REWARD_ICON_IDS defined in icons.js


const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// ============================================================
// INIT
// ============================================================

window.addEventListener('load', async () => {
  // Show loading screen
  showScreen('loading-screen');

  // Give loading bar time to animate
  await delay(1800);

  const storageResult = await initStorage();

  if (storageResult === 'setup_needed') {
    showScreen('setup-screen');
  } else {
    checkDailyReset();
    showMainApp();
  }
});

function showMainApp() {
  showScreen('main-screen');
  renderAll();
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function renderAll() {
  renderProfileTabs();
  if (currentProfile === 'parent') {
    renderParentView();
  } else {
    renderChildView(currentProfile);
  }
}

// ============================================================
// PROFILE TABS
// ============================================================

function renderProfileTabs() {
  const wrap = document.getElementById('profile-tabs');
  let html = state.children.map((child, i) => {
    const active = currentProfile === i;
    return `<button class="profile-chip${active ? ' active' : ''}" onclick="switchProfile(${i})">
      <div class="chip-avatar"><canvas id="chip-av-${i}" width="52" height="52"></canvas></div>
      ${child.name}
    </button>`;
  }).join('');
  html += `<button class="profile-chip${currentProfile === 'parent' ? ' active' : ''}" onclick="switchProfile('parent')">
    <div class="chip-parent">\u2699\uFE0F</div> Parent
  </button>`;
  wrap.innerHTML = html;

  // Draw chip avatars after DOM update
  requestAnimationFrame(() => {
    state.children.forEach((child, i) => {
      const c = document.getElementById(`chip-av-${i}`);
      if (c) drawAvatar(c, child.avatar || DEFAULT_AVATAR);
    });
  });
}

function switchProfile(idx) {
  if (idx === 'parent') { requestParentAccess(); return; }
  activateProfile(idx);
}

function activateProfile(idx) {
  currentProfile = idx;
  currentViewTab = 'tasks';
  currentParentTab = 'overview';
  renderProfileTabs();
  const childView = document.getElementById('child-view');
  const parentView = document.getElementById('parent-view');
  childView.classList.toggle('active', idx !== 'parent');
  parentView.classList.toggle('active', idx === 'parent');
  if (idx === 'parent') renderParentView();
  else renderChildView(idx);
}

// ============================================================
// CHILD VIEW
// ============================================================

function renderChildView(idx) {
  const child = state.children[idx];
  if (!child) return;

  // Draw hero avatar
  requestAnimationFrame(() => {
    const c = document.getElementById('hero-avatar');
    if (c) drawAvatar(c, child.avatar || DEFAULT_AVATAR);
  });

  // Hero info
  document.getElementById('hero-name').textContent = child.name;
  const todayDone = Object.keys(child.completedToday || {}).length;
  const totalTasks = state.tasks.length;
  document.getElementById('hero-stats').innerHTML = `
    <div class="hero-stat"><div class="hero-stat-val">${child.points}</div><div class="hero-stat-label">Stars</div></div>
    <div class="hero-stat"><div class="hero-stat-val">${child.streak || 0}</div><div class="hero-stat-label">Day streak</div></div>
    <div class="hero-stat"><div class="hero-stat-val">${todayDone}/${totalTasks}</div><div class="hero-stat-label">Today</div></div>
  `;

  // Streak badge
  const sb = document.getElementById('hero-streak');
  sb.textContent = (child.streak || 0) > 0 ? `\uD83D\uDD25 ${child.streak} days` : '\uD83C\uDF31 Start streak';

  // Click avatar to edit
  document.getElementById('hero-avatar').onclick = () => openAvatarEditor(idx);

  // Streak days row
  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7; // Mon=0
  const streakHtml = DAY_LABELS.map((label, i) => {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() - (todayDow - i));
    const yyyy = dayDate.getFullYear();
    const mm   = String(dayDate.getMonth() + 1).padStart(2, '0');
    const dd   = String(dayDate.getDate()).padStart(2, '0');
    const key  = `${yyyy}-${mm}-${dd}`;
    const isTodayDay = i === todayDow;
    const isPast = i < todayDow;
    const done = (child.streakDays || {})[key] || (isTodayDay && todayDone > 0);
    let cls = 'day-bubble ';
    if (done) cls += 'past';
    else if (isTodayDay) cls += 'today';
    else if (isPast) cls += 'future';
    else cls += 'future';
    return `<div class="${cls}">
      <div class="day-check">${done ? '\u2713' : label}</div>
    </div>`;
  }).join('');
  document.getElementById('streak-row').innerHTML = streakHtml;

  // Next reward progress
  renderNextReward(child);

  // Tasks
  renderTasks(child, idx);

  // Rewards
  renderRewardsGrid(child);

  // History
  renderHistory(child);
}

function renderNextReward(child) {
  const pointsRewards = state.rewards.filter(r => r.type === 'points' && r.cost > child.points);
  pointsRewards.sort((a,b) => a.cost - b.cost);
  const next = pointsRewards[0];
  const banner = document.getElementById('next-reward');
  if (next) {
    const pct = Math.min(100, Math.round(child.points / next.cost * 100));
    banner.innerHTML = `
      <div class="nr-icon">${iconSvgLg(next.icon || 'gift')}</div>
      <div class="nr-info">
        <div class="nr-name">Working toward: ${next.name}</div>
        <div class="nr-sub">${child.points} / ${next.cost} stars</div>
        <div class="nr-bar"><div class="nr-fill" style="width:${pct}%"></div></div>
      </div>
    `;
    banner.style.display = 'flex';
  } else {
    const streakRewards = state.rewards.filter(r => r.type !== 'points');
    if (streakRewards.length) {
      banner.innerHTML = `<div class="nr-icon">${iconSvgLg('star')}</div><div class="nr-info"><div class="nr-name">Keep your streak for bonus rewards!</div><div class="nr-sub">Check the Rewards tab</div></div>`;
      banner.style.display = 'flex';
    } else {
      banner.style.display = 'none';
    }
  }
}

function renderTasks(child, childIdx) {
  const list = document.getElementById('task-list');
  const doneBanner = document.getElementById('all-done-banner');
  if (!state.tasks.length) {
    list.innerHTML = '<div style="text-align:center;color:#9CA3AF;padding:24px;font-size:14px;">No quests yet \u2014 ask a parent to add some! \uD83C\uDFF0</div>';
    doneBanner.style.display = 'none';
    return;
  }
  const allDone = state.tasks.every(t => child.completedToday[t.id]);
  doneBanner.style.display = allDone ? 'block' : 'none';

  list.innerHTML = state.tasks.map(task => {
    const done = !!(child.completedToday && child.completedToday[task.id]);
    return `<div class="task-item${done ? ' done' : ''}" onclick="toggleTask('${task.id}',${childIdx})">
      <div class="task-check"><div class="task-check-inner"></div></div>
      <div class="task-icon">${iconSvg(task.icon || 'star', 22)}</div>
      <div class="task-name">${task.name}</div>
      <div class="task-pts-badge">+${task.pts}</div>
    </div>`;
  }).join('');
}

function toggleTask(taskId, childIdx) {
  const child = state.children[childIdx];
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  if (child.completedToday[taskId]) {
    delete child.completedToday[taskId];
    child.points = Math.max(0, child.points - task.pts);
    showToast(`-${task.pts} stars removed`);
  } else {
    child.completedToday[taskId] = true;
    child.points += task.pts;

    // Mark today in streakDays
    const todayKey_ = todayKey();
    child.streakDays = child.streakDays || {};
    child.streakDays[todayKey_] = true;
    child.streak = calcStreak(child.streakDays);

    showToast(`+${task.pts} stars! Keep going! \u2B50`);

    // Fire confetti if all done
    const allDone = state.tasks.every(t => child.completedToday[t.id]);
    if (allDone) setTimeout(() => fireConfetti(), 200);
  }

  persist();
  renderChildView(childIdx);
}

function renderRewardsGrid(child) {
  const grid = document.getElementById('rewards-grid');
  if (!state.rewards.length) {
    grid.innerHTML = '<div style="text-align:center;color:#9CA3AF;padding:24px;font-size:14px;grid-column:span 2;">No rewards yet \u2014 ask a parent to add some!</div>';
    return;
  }
  grid.innerHTML = state.rewards.map(r => {
    let unlocked = false;
    let typeLabel = '';
    let isStreak = false;
    if (r.type === 'points') {
      unlocked = child.points >= r.cost;
      typeLabel = `${r.cost} stars`;
    } else if (r.type === 'streak5') {
      unlocked = (child.streak || 0) >= 5;
      typeLabel = '5-day streak';
      isStreak = true;
    } else {
      unlocked = (child.streak || 0) >= 7;
      typeLabel = '7-day streak';
      isStreak = true;
    }
    return `<div class="reward-card${unlocked ? ' unlocked' : ''}${isStreak ? ' streak-reward' : ''}" onclick="tryClaimReward('${r.id}',${unlocked},'${child.name}')">
      ${unlocked ? '<div class="reward-unlocked-glow"></div>' : ''}
      ${isStreak ? `<div class="reward-streak-badge">\uD83D\uDD25 Streak</div>` : ''}
      <div class="reward-icon">${iconSvgLg(r.icon || 'gift', 'currentColor')}</div>
      <div class="reward-name">${r.name}</div>
      <div class="reward-type">${typeLabel}</div>
      ${unlocked ? '<div class="reward-unlocked-label">Ready to claim!</div>' : ''}
    </div>`;
  }).join('');
}

function tryClaimReward(rewardId, unlocked, childName) {
  const reward = state.rewards.find(r => r.id === rewardId);
  if (!reward) return;
  const modal = document.getElementById('modal-claim');
  document.getElementById('claim-icon').innerHTML = iconSvg(reward.icon || 'gift', 56);
  document.getElementById('claim-name').textContent = reward.name;
  if (unlocked) {
    document.getElementById('claim-msg').textContent = `You've earned this! Show Mum or Dad.`;
  } else {
    if (reward.type === 'points') {
      const child = state.children[currentProfile];
      const needed = reward.cost - (child ? child.points : 0);
      document.getElementById('claim-msg').textContent = `You need ${needed} more stars to unlock this!`;
    } else {
      document.getElementById('claim-msg').textContent = `Keep your streak going to unlock this!`;
    }
  }
  document.getElementById('modal-claim').dataset.unlocked = unlocked;
  document.getElementById('modal-claim').dataset.rewardId = rewardId;
  openModal('modal-claim');
}

function confirmClaim() {
  showToast('Tell Mum or Dad \u2014 your reward is ready! \uD83C\uDF89');
  closeModal();
}

function renderHistory(child) {
  const log = child.dailyLog || {};
  const keys = Object.keys(log).sort().reverse().slice(0, 14);
  const wrap = document.getElementById('history-list');
  if (!keys.length) {
    wrap.innerHTML = '<div style="text-align:center;color:#9CA3AF;padding:24px;font-size:14px;">Complete quests to build your history! \uD83D\uDCD6</div>';
    return;
  }
  wrap.innerHTML = keys.map(key => {
    const entry = log[key];
    const d = new Date(key);
    const label = d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
    return `<div class="history-item">
      <div class="history-emoji">\u2B50</div>
      <div class="history-task">${entry.tasks} quest${entry.tasks !== 1 ? 's' : ''} completed</div>
      <div class="history-pts">+${entry.pts}</div>
      <div class="history-date">${label}</div>
    </div>`;
  }).join('');
}

// ---- View tab switcher ----
function switchViewTab(tab, btn) {
  currentViewTab = tab;
  document.querySelectorAll('.vtab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.vtab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(`vtab-${tab}`).classList.add('active');
}

// ============================================================
// PARENT VIEW
// ============================================================

function renderParentView() {
  switch(currentParentTab) {
    case 'overview': renderOverview(); break;
    case 'tasks': renderAdminTasks(); break;
    case 'rewards': renderAdminRewards(); break;
    case 'children': renderAdminChildren(); break;
    case 'summary': renderWeeklySummary(); break;
  }
}

function switchParentTab(tab, btn) {
  currentParentTab = tab;
  document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.ptab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(`ptab-${tab}`).classList.add('active');
  renderParentView();
}

function renderOverview() {
  const wrap = document.getElementById('parent-overview');
  wrap.innerHTML = '<button class="change-pin-btn" onclick="openChangePinSetup()">\uD83D\uDD12 Change parent PIN</button>' +
    state.children.map((child, i) => {
    const todayDone = Object.keys(child.completedToday || {}).length;
    const todayPts = Object.keys(child.completedToday || {}).reduce((sum, tid) => {
      const t = state.tasks.find(t => t.id === tid);
      return sum + (t ? t.pts : 0);
    }, 0);
    const totalPossible = state.tasks.reduce((s,t) => s + t.pts, 0);
    const pct = totalPossible > 0 ? Math.round(todayPts / totalPossible * 100) : 0;

    return `<div class="overview-child-card">
      <div class="occ-header">
        <div class="occ-avatar"><canvas id="occ-av-${i}" width="88" height="88"></canvas></div>
        <div>
          <div class="occ-name">${child.name}</div>
          <div class="occ-streak">\uD83D\uDD25 ${child.streak || 0} day streak \u00B7 Age ${child.age || '?'}</div>
        </div>
      </div>
      <div class="occ-stats">
        <div class="occ-stat"><div class="occ-stat-val">${child.points}</div><div class="occ-stat-label">Total stars</div></div>
        <div class="occ-stat"><div class="occ-stat-val">${todayDone}/${state.tasks.length}</div><div class="occ-stat-label">Today</div></div>
        <div class="occ-stat"><div class="occ-stat-val">${pct}%</div><div class="occ-stat-label">Pts today</div></div>
      </div>
      <div class="occ-tasks">${todayDone === state.tasks.length && state.tasks.length > 0 ? '\uD83C\uDF89 All quests done today!' : `${state.tasks.length - todayDone} quest${state.tasks.length - todayDone !== 1 ? 's' : ''} remaining`}</div>
      <div class="occ-actions">
        <button class="occ-btn reset" onclick="resetChildDay(${i})">Reset day</button>
        <button class="occ-btn avatar" onclick="openAvatarEditor(${i})">Edit avatar</button>
      </div>
    </div>`;
  }).join('');

  requestAnimationFrame(() => {
    state.children.forEach((child, i) => {
      const c = document.getElementById(`occ-av-${i}`);
      if (c) drawAvatar(c, child.avatar || DEFAULT_AVATAR);
    });
  });
}

function resetChildDay(idx) {
  if (!confirm(`Reset ${state.children[idx].name}'s completed tasks for today?`)) return;
  const child = state.children[idx];
  const todayPts = Object.keys(child.completedToday || {}).reduce((sum, tid) => {
    const t = state.tasks.find(t => t.id === tid);
    return sum + (t ? t.pts : 0);
  }, 0);
  child.points = Math.max(0, child.points - todayPts);
  child.completedToday = {};
  persist();
  renderParentView();
  showToast(`${child.name}'s day reset`);
}

function renderAdminTasks() {
  const wrap = document.getElementById('admin-task-list');
  wrap.innerHTML = state.tasks.map(task => `
    <div class="admin-item">
      <div class="admin-item-icon">${iconSvg(task.icon || 'star', 22)}</div>
      <div>
        <div class="admin-item-name">${task.name}</div>
      </div>
      <div class="admin-item-badge">${task.pts} pts</div>
      <button class="admin-del" onclick="deleteTask('${task.id}')">\u00D7</button>
    </div>
  `).join('') || '<div style="color:#9CA3AF;font-size:14px;padding:12px;">No tasks yet</div>';
}

function renderAdminRewards() {
  const wrap = document.getElementById('admin-reward-list');
  wrap.innerHTML = state.rewards.map(r => {
    const typeLabel = r.type === 'points' ? `${r.cost} pts` : r.type === 'streak5' ? '5-day streak' : '7-day streak';
    return `<div class="admin-item">
      <div class="admin-item-icon">${iconSvg(r.icon || 'gift', 22)}</div>
      <div>
        <div class="admin-item-name">${r.name}</div>
        <div class="admin-item-sub">${typeLabel}</div>
      </div>
      <button class="admin-del" onclick="deleteReward('${r.id}')">\u00D7</button>
    </div>`;
  }).join('') || '<div style="color:#9CA3AF;font-size:14px;padding:12px;">No rewards yet</div>';
}

function renderAdminChildren() {
  const wrap = document.getElementById('admin-children-list');
  wrap.innerHTML = state.children.map((child, i) => `
    <div class="admin-item">
      <div class="admin-item-emoji" style="font-size:24px">\uD83D\uDC66</div>
      <div style="flex:1">
        <div class="admin-item-name">${child.name}</div>
        <div class="admin-item-sub">Age ${child.age || '?'} \u00B7 ${child.points} stars \u00B7 ${child.streak || 0}d streak</div>
      </div>
      <button class="occ-btn avatar" style="font-size:12px;padding:6px 12px;background:var(--purple-light);color:var(--purple);border:none;border-radius:var(--radius-sm);cursor:pointer;font-family:var(--font);font-weight:700" onclick="openAvatarEditor(${i})">Avatar</button>
      <button class="admin-del" onclick="deleteChild(${i})">\u00D7</button>
    </div>
  `).join('') || '<div style="color:#9CA3AF;font-size:14px;padding:12px;">No children yet \u2014 add one above!</div>';
}

function deleteChild(idx) {
  const child = state.children[idx];
  if (!confirm(`Remove ${child.name} from Quest Board? This will delete all their stars, streaks and history.`)) return;
  state.children.splice(idx, 1);
  if (currentProfile === idx || currentProfile >= state.children.length) {
    currentProfile = state.children.length > 0 ? 0 : 'parent';
  }
  persist();
  renderAll();
  showToast(`${child.name} removed`);
}

function renderWeeklySummary() {
  const wrap = document.getElementById('weekly-summary');
  const today = new Date();
  const weekDates = Array.from({length: 7}, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  let html = `<div class="summary-header">\uD83D\uDCCA This week's report</div>`;

  html += state.children.map(child => {
    const log = child.dailyLog || {};
    const weekEntries = weekDates.map(k => log[k]).filter(Boolean);
    const weekPts = weekEntries.reduce((s, e) => s + e.pts, 0);
    const weekTasks = weekEntries.reduce((s, e) => s + e.tasks, 0);
    const daysActive = weekEntries.length;

    // Today
    const todayPts = Object.keys(child.completedToday || {}).reduce((sum, tid) => {
      const t = state.tasks.find(t => t.id === tid);
      return sum + (t ? t.pts : 0);
    }, 0);
    const todayTasks = Object.keys(child.completedToday || {}).length;
    const totalPts = weekPts + todayPts;
    const totalTasks = weekTasks + todayTasks;

    const bestDay = weekDates.reduce((best, k) => {
      const e = log[k];
      if (!e) return best;
      return e.pts > (best ? (log[best] ? log[best].pts : 0) : 0) ? k : best;
    }, null);
    const bestDateLabel = bestDay ? new Date(bestDay).toLocaleDateString('en-AU', { weekday: 'long' }) : 'N/A';

    const tip = daysActive >= 5
      ? `<strong>Brilliant week!</strong> ${child.name} was active ${daysActive} days. Consider a bonus reward!`
      : daysActive >= 3
      ? `<strong>Good effort!</strong> ${child.name} completed quests on ${daysActive} days. Keep encouraging the daily habit.`
      : `<strong>Needs encouragement.</strong> Only ${daysActive} active day${daysActive !== 1 ? 's' : ''} this week \u2014 try setting a smaller goal to rebuild the habit.`;

    return `<div class="summary-child">
      <div class="summary-child-name">
        <span style="font-size:22px">\uD83D\uDC66</span> ${child.name}
      </div>
      <div class="summary-grid">
        <div class="summary-stat"><div class="summary-stat-val">${totalPts}</div><div class="summary-stat-label">Stars earned</div></div>
        <div class="summary-stat"><div class="summary-stat-val">${totalTasks}</div><div class="summary-stat-label">Quests done</div></div>
        <div class="summary-stat"><div class="summary-stat-val">${daysActive}</div><div class="summary-stat-label">Active days</div></div>
        <div class="summary-stat"><div class="summary-stat-val">${child.streak || 0}</div><div class="summary-stat-label">Day streak</div></div>
      </div>
      <div class="summary-top-tasks">Best day: <strong>${bestDateLabel}</strong></div>
      <div class="summary-tip">${tip}</div>
    </div>`;
  }).join('');

  wrap.innerHTML = html;
}

// ============================================================
// TASK MODAL
// ============================================================

function openAddTask() {
  editingTaskId = null;
  currentTaskIcon = 'star';
  currentPts = 15;
  document.getElementById('modal-task-title').textContent = 'New Quest';
  document.getElementById('task-input-name').value = '';
  renderIconGrid('task-icon-grid', TASK_ICON_IDS, 'task');
  resetPtsGrid();
  openModal('modal-task');
}

function saveTask() {
  const name = document.getElementById('task-input-name').value.trim();
  if (!name) { showToast('Please enter a quest name'); return; }
  if (editingTaskId) {
    const task = state.tasks.find(t => t.id === editingTaskId);
    if (task) { task.name = name; task.pts = currentPts; task.icon = currentTaskIcon; }
  } else {
    state.tasks.push({ id: 't' + (++state.nextId), name, pts: currentPts, icon: currentTaskIcon });
  }
  persist();
  renderAdminTasks();
  closeModal();
  showToast('Quest saved! \u2B50');
}

function deleteTask(id) {
  if (!confirm('Delete this quest?')) return;
  state.tasks = state.tasks.filter(t => t.id !== id);
  state.children.forEach(c => { delete c.completedToday[id]; });
  persist();
  renderAdminTasks();
  showToast('Quest deleted');
}

// ============================================================
// REWARD MODAL
// ============================================================

function openAddReward() {
  editingRewardId = null;
  currentRewardIcon = 'gift';
  currentRewardType = 'points';
  document.getElementById('modal-reward-title').textContent = 'New Reward';
  document.getElementById('reward-input-name').value = '';
  document.getElementById('reward-input-cost').value = '50';
  document.getElementById('reward-cost-wrap').style.display = 'block';
  renderIconGrid('reward-icon-grid', REWARD_ICON_IDS, 'reward');
  document.querySelectorAll('.type-opt').forEach(b => b.classList.toggle('selected', b.dataset.type === 'points'));
  openModal('modal-reward');
}

function saveReward() {
  const name = document.getElementById('reward-input-name').value.trim();
  if (!name) { showToast('Please enter a reward name'); return; }
  const cost = parseInt(document.getElementById('reward-input-cost').value) || 50;
  if (editingRewardId) {
    const r = state.rewards.find(r => r.id === editingRewardId);
    if (r) { r.name = name; r.icon = currentRewardIcon; r.type = currentRewardType; r.cost = cost; }
  } else {
    state.rewards.push({ id: 'r' + (++state.nextId), name, icon: currentRewardIcon, type: currentRewardType, cost });
  }
  persist();
  renderAdminRewards();
  closeModal();
  showToast('Reward saved! \uD83C\uDF81');
}

function deleteReward(id) {
  if (!confirm('Delete this reward?')) return;
  state.rewards = state.rewards.filter(r => r.id !== id);
  persist();
  renderAdminRewards();
  showToast('Reward deleted');
}

function selectRewardType(btn) {
  currentRewardType = btn.dataset.type;
  document.querySelectorAll('.type-opt').forEach(b => b.classList.toggle('selected', b === btn));
  document.getElementById('reward-cost-wrap').style.display = currentRewardType === 'points' ? 'block' : 'none';
}

// ============================================================
// CHILD MODAL
// ============================================================

function openAddChild() {
  document.getElementById('child-input-name').value = '';
  document.getElementById('child-input-age').value = '8';
  openModal('modal-child');
}

function saveChild() {
  const name = document.getElementById('child-input-name').value.trim();
  const age = parseInt(document.getElementById('child-input-age').value) || 8;
  if (!name) { showToast('Please enter a name'); return; }
  state.children.push({
    id: 'child_' + (++state.nextId),
    name, age, points: 0,
    avatar: Object.assign({}, DEFAULT_AVATAR),
    completedToday: {},
    dailyLog: {},
    streak: 0,
    streakDays: {},
  });
  persist();
  renderAll();
  closeModal();
  showToast(`${name} added! \uD83C\uDF89`);
}

// ============================================================
// MODAL HELPERS
// ============================================================

function openModal(id) {
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
  document.getElementById(id).style.display = 'block';
  document.getElementById('modal-overlay').classList.add('active');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay')) return;
  document.getElementById('modal-overlay').classList.remove('active');
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

function selectPts(btn) {
  currentPts = parseInt(btn.dataset.pts);
  document.querySelectorAll('.pts-opt').forEach(b => b.classList.toggle('selected', b === btn));
}

function resetPtsGrid() {
  document.querySelectorAll('.pts-opt').forEach(b => b.classList.toggle('selected', parseInt(b.dataset.pts) === 15));
}

function renderIconGrid(containerId, iconIds, type) {
  const current = type === 'task' ? currentTaskIcon : currentRewardIcon;
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = iconIds.map(id => `
    <button class="icon-opt${id === current ? ' selected' : ''}" onclick="selectIcon('${id}','${type}',this)" title="${(ICONS[id]||{}).label||id}">
      ${iconSvg(id, 22)}
    </button>
  `).join('');
}

function selectIcon(iconId, type, btn) {
  if (type === 'task') currentTaskIcon = iconId;
  else currentRewardIcon = iconId;
  const gridId = type === 'task' ? 'task-icon-grid' : 'reward-icon-grid';
  document.querySelectorAll(`#${gridId} .icon-opt`).forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

// ============================================================
// TOAST
// ============================================================

let toastTimeout;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 2400);
}

// ============================================================
// CONFETTI
// ============================================================

function fireConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const pieces = Array.from({length: 80}, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    r: Math.random() * 8 + 4,
    c: ['#1D9E75','#F5A623','#7C5CBF','#FF6B6B','#378ADD','#FFD700'][Math.floor(Math.random()*6)],
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 4 + 2,
    rot: Math.random() * 360,
    vrot: (Math.random() - 0.5) * 8,
  }));
  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r * 0.5);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.rot += p.vrot; p.vy += 0.1;
    });
    frame++;
    if (frame < 120) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

// ============================================================
// UTILS
// ============================================================

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// PIN SYSTEM
// ============================================================

const PIN_STORAGE_KEY = 'qb_pin_hash';
let pinBuffer = '';
let pinSetupBuffer = '';
let pinSetupStage = 'first'; // 'first' | 'confirm'
let pinSetupFirst = '';

// Simple non-crypto hash \u2014 good enough for family use
async function hashPin(pin) {
  const data = new TextEncoder().encode('qb_salt_' + pin);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function getStoredHash() {
  return localStorage.getItem(PIN_STORAGE_KEY);
}

// Called when tapping the parent chip
function requestParentAccess() {
  const hash = getStoredHash();
  if (!hash) {
    // No PIN set yet \u2014 go straight to setup
    openPinSetup('Set a parent PIN', 'Choose a 4-digit PIN to protect the parent area');
    return;
  }
  // Show PIN entry modal
  pinBuffer = '';
  updatePinDots('pin-dots', 'pd', 0, false);
  document.getElementById('pin-error').textContent = '';
  openModal('modal-pin');
}

function pinKey(digit) {
  if (pinBuffer.length >= 4) return;
  pinBuffer += digit;
  updatePinDots('pin-dots', 'pd', pinBuffer.length, false);
  if (pinBuffer.length === 4) setTimeout(pinSubmit, 120);
}

function pinClear() {
  pinBuffer = pinBuffer.slice(0, -1);
  updatePinDots('pin-dots', 'pd', pinBuffer.length, false);
}

async function pinSubmit() {
  if (pinBuffer.length < 4) return;
  const hash  = await hashPin(pinBuffer);
  const saved = getStoredHash();
  if (hash === saved) {
    closeModal();
    activateProfile('parent');
  } else {
    pinBuffer = '';
    updatePinDots('pin-dots', 'pd', 0, true); // flash error
    document.getElementById('pin-error').textContent = 'Wrong PIN \u2014 try again';
    setTimeout(() => {
      updatePinDots('pin-dots', 'pd', 0, false);
      document.getElementById('pin-error').textContent = '';
    }, 900);
  }
}

function cancelPin() {
  pinBuffer = '';
  closeModal();
}

// PIN setup (first time or change)
function openPinSetup(title, msg) {
  pinSetupBuffer = '';
  pinSetupStage  = 'first';
  pinSetupFirst  = '';
  document.getElementById('pin-setup-title').textContent = title || 'Set a parent PIN';
  document.getElementById('pin-setup-msg').textContent   = msg   || 'Choose a 4-digit PIN';
  document.getElementById('pin-setup-error').textContent = '';
  updatePinDots('pin-setup-dots', 'spd', 0, false);
  // Close any open modal first, then open setup
  document.getElementById('modal-overlay').classList.add('active');
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
  document.getElementById('modal-pin-setup').style.display = 'block';
}

function openChangePinSetup() {
  const existing = getStoredHash();
  if (existing) {
    openPinSetup('Change parent PIN', 'Enter a new 4-digit PIN');
  } else {
    openPinSetup('Set a parent PIN', 'Choose a 4-digit PIN to protect the parent area');
  }
}

function pinSetupKey(digit) {
  if (pinSetupBuffer.length >= 4) return;
  pinSetupBuffer += digit;
  updatePinDots('pin-setup-dots', 'spd', pinSetupBuffer.length, false);
  if (pinSetupBuffer.length === 4) setTimeout(pinSetupSubmit, 120);
}

function pinSetupClear() {
  pinSetupBuffer = pinSetupBuffer.slice(0, -1);
  updatePinDots('pin-setup-dots', 'spd', pinSetupBuffer.length, false);
}

async function pinSetupSubmit() {
  if (pinSetupBuffer.length < 4) return;
  if (pinSetupStage === 'first') {
    pinSetupFirst  = pinSetupBuffer;
    pinSetupBuffer = '';
    pinSetupStage  = 'confirm';
    document.getElementById('pin-setup-msg').textContent = 'Enter the same PIN again to confirm';
    updatePinDots('pin-setup-dots', 'spd', 0, false);
    document.getElementById('pin-setup-error').textContent = '';
  } else {
    // Confirm stage
    if (pinSetupBuffer === pinSetupFirst) {
      const hash = await hashPin(pinSetupBuffer);
      localStorage.setItem(PIN_STORAGE_KEY, hash);
      closeModal();
      showToast('PIN saved! \uD83D\uDD12');
      // If we weren't in parent view yet, go there now
      activateProfile('parent');
    } else {
      pinSetupBuffer = '';
      pinSetupFirst  = '';
      pinSetupStage  = 'first';
      updatePinDots('pin-setup-dots', 'spd', 0, true);
      document.getElementById('pin-setup-error').textContent = "PINs didn't match \u2014 start again";
      document.getElementById('pin-setup-msg').textContent = 'Choose a 4-digit PIN';
      setTimeout(() => {
        updatePinDots('pin-setup-dots', 'spd', 0, false);
        document.getElementById('pin-setup-error').textContent = '';
      }, 900);
    }
  }
}

function updatePinDots(containerId, prefix, filled, isError) {
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`${prefix}${i}`);
    if (!el) continue;
    el.classList.toggle('filled', !isError && i < filled);
    el.classList.toggle('error',  isError);
  }
}
