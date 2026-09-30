// Preserve functionality when storage is blocked or full; tell the visitor explicitly.
const memory = new Map();
let warned = false;
function unavailable() {
  if (!warned) {
    warned = true;
    window.dispatchEvent(new Event("udaan:storage-unavailable"));
  }
}
export const storage = {
  getItem(key) {
    if (memory.has(key)) return memory.get(key);
    try { return localStorage.getItem(key); } catch { unavailable(); return null; }
  },
  setItem(key, value) {
    memory.set(key, String(value));
    try { localStorage.setItem(key, value); } catch { unavailable(); }
  },
  removeItem(key) {
    memory.set(key, null);
    try { localStorage.removeItem(key); } catch { unavailable(); }
  },
  isTemporary: () => warned,
};
