// ============================================================
// VERSION CONTROL — Quest Board
// Registers the service worker and polls version.json.
// When a new deploy is detected, prompts a silent reload.
// ============================================================

const VERSION_CHECK_INTERVAL = 60 * 1000; // check every 60 seconds
let currentVersion = null;

// ---- Register service worker ----
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });

    // If a new SW is waiting, activate it immediately
    if (reg.waiting) activateNewWorker(reg.waiting);

    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          activateNewWorker(newWorker);
        }
      });
    });

    // Reload the page once the new SW takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) { refreshing = true; window.location.reload(); }
    });

  } catch (e) {
    console.warn('Service worker registration failed:', e);
  }
}

function activateNewWorker(worker) {
  worker.postMessage('skipWaiting');
}

// ---- Poll version.json for changes ----
async function checkForUpdate() {
  try {
    const res = await fetch('./version.json?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();

    if (currentVersion === null) {
      // First load — store current version
      currentVersion = data.version;
      return;
    }

    if (data.version !== currentVersion) {
      console.log(`[Quest Board] New version detected: ${data.version} (was ${currentVersion})`);
      currentVersion = data.version;

      // Delete all caches and reload cleanly
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }

      // Tell service worker to update
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage('skipWaiting');
      }

      // Show a brief toast then reload
      showUpdateToast();
    }
  } catch (e) {
    // Network unavailable — silently ignore
  }
}

function showUpdateToast() {
  // Reuse the app's existing toast if available, otherwise plain alert
  if (typeof showToast === 'function') {
    showToast('✨ Updating to latest version...');
    setTimeout(() => window.location.reload(), 1800);
  } else {
    window.location.reload();
  }
}

// ---- Init ----
window.addEventListener('load', () => {
  registerServiceWorker();
  // Initial check
  checkForUpdate();
  // Periodic checks
  setInterval(checkForUpdate, VERSION_CHECK_INTERVAL);
  // Also check when tab becomes visible again (user switches back to app)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });
});
