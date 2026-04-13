import type { DefineAble } from "./types";
import { isFunction } from "lodash-unified";

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

async function resolveDefineAble<T>(config: DefineAble<T>) {
  if (isFunction(config)) return await config();
  return (config ?? {}) as T;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function isNode() {
  return typeof process !== "undefined" && process.release?.name === "node";
}

/* ==================== shared const ==================== */
// just serve for build&node, can't be use `await import(VIRTUAL_INDEX_CONFIG_PKG)` in client side
const VIRTUAL_INDEX_I18N_PKG = "virtual:index-i18n";
const VIRTUAL_INDEX_ADDITION_PKG = "virtual:index-addition";
const VIRTUAL_INDEX_SEARCH_PKG = "virtual:index-search";
const VIRTUAL_INDEX_ARCHIVE_PKG = "virtual:index-archive";

const INDEX_CONFIG_NAME = "vti.config";
const INDEX_ADDITION_NAME = "vti.addition";

export {
  ensureArray,
  escapeRegex,
  hasOwnProperty,
  resolveDefineAble,
  clearObject,
  isBrowser,
  isNode,
  VIRTUAL_INDEX_I18N_PKG,
  VIRTUAL_INDEX_ADDITION_PKG,
  VIRTUAL_INDEX_SEARCH_PKG,
  VIRTUAL_INDEX_ARCHIVE_PKG,
  INDEX_CONFIG_NAME,
  INDEX_ADDITION_NAME,
};
