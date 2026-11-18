// Story ids this device has already viewed, so rings can show seen/unseen. A per-device convenience only.
const KEY = 'clarke-seen-stories';
const MAX_IDS = 500;

export function readSeenStories() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function saveSeenStories(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...ids].slice(-MAX_IDS)));
  } catch {
    // Storage blocked or full: rings simply show as unseen next time.
  }
}
