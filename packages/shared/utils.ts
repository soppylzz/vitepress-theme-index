/* ==================== shared utils ==================== */
function ensureArray<T>(obj: T | readonly T[] | T[]): T[] {
  return Array.isArray(obj) ? [...obj] : [obj as T];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasOwnProperty<T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function clearObject(obj: object) {
  Object.keys(obj).forEach((key) => delete obj[key]);
}

/* ==================== shared const ==================== */
// just serve for build&node, can't be use `await import(VIRTUAL_INDEX_CONFIG_PKG)` in client side
const VIRTUAL_INDEX_CONFIG_PKG = "virtual:index-config";
const VIRTUAL_INDEX_LOCALE_PKG = "virtual:index-locale";

export {
  ensureArray,
  escapeRegex,
  hasOwnProperty,
  clearObject,
  VIRTUAL_INDEX_CONFIG_PKG,
  VIRTUAL_INDEX_LOCALE_PKG,
};
