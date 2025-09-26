// Bộ nhớ an toàn: fallback sang in-memory nếu localStorage không dùng được (ví dụ iOS Private Mode)
class MemoryStore {
  constructor() {
    this.m = new Map();
  }
  getItem(k) { return this.m.get(k) || null; }
  setItem(k, v) { this.m.set(k, v); }
  removeItem(k) { this.m.delete(k); }
  clear() { this.m.clear(); }
}

function canUseLocalStorage() {
  try {
    const k = '__t__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
}

export const safeStorage = canUseLocalStorage()
  ? window.localStorage
  : new MemoryStore();

const TOKEN_KEY = 'access_token';

export function getAccessToken() {
  return safeStorage.getItem(TOKEN_KEY);
}
export function setAccessToken(token) {
  if (!token) return safeStorage.removeItem(TOKEN_KEY);
  safeStorage.setItem(TOKEN_KEY, token);
}
export function clearAccessToken() {
  safeStorage.removeItem(TOKEN_KEY);
}
