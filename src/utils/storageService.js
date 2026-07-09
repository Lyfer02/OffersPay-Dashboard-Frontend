// /src/utils/storageService.js

const StorageService = {
  set(key, value, type = "local") {
    const storage = type === "session" ? sessionStorage : localStorage;
    if (typeof value === "string") {
      storage.setItem(key, value);
    } else {
      storage.setItem(key, JSON.stringify(value));
    }
  },

  get(key) {
    const sessionValue = sessionStorage.getItem(key);
    if (sessionValue) return parseData(sessionValue);

    const localValue = localStorage.getItem(key);
    if (localValue) return parseData(localValue);

    return null;
  },

  getSession(key) {
    const value = sessionStorage.getItem(key);
    return value ? parseData(value) : null;
  },

  getLocal(key) {
    const value = localStorage.getItem(key);
    return value ? parseData(value) : null;
  },

  remove(key) {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  },

  clearAll() {
    sessionStorage.clear();
    localStorage.clear();
  },

  isImpersonating() {
    return !!sessionStorage.getItem("originalUser");
  },
};

function parseData(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export default StorageService;
