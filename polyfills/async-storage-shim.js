// Lightweight shim for @react-native-async-storage/async-storage on web
const store = new Map();

export default {
  getItem: async (key) => {
    return store.has(key) ? store.get(key) : null;
  },
  setItem: async (key, value) => {
    store.set(key, value);
    return null;
  },
  removeItem: async (key) => {
    store.delete(key);
    return null;
  },
  clear: async () => {
    store.clear();
    return null;
  },
};
