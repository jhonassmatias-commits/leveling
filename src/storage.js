// Adapter: fora do Claude.ai usa localStorage
const PREFIX = 'rpg_';

export const storage = {
  async get(key) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v ? { key, value: v } : null;
    } catch { return null; }
  },
  async set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, value);
      return { key, value };
    } catch { return null; }
  },
  async delete(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      return { key, deleted: true };
    } catch { return null; }
  },
};

// Injeta no window para o App.jsx usar a mesma API
if (typeof window !== 'undefined' && !window.storage) {
  window.storage = storage;
}
