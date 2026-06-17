/* Safe localStorage — works on server (Vercel SSR) and client */
export const ls = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem(key); return v !== null ? v : fallback; }
    catch { return fallback; }
  },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch { /* noop */ } },
  remove: (key) => { try { localStorage.removeItem(key); } catch { /* noop */ } },
};
