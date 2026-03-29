import type { DefineAble } from "@vitepress-theme-index/shared/types";
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

/* ==================== shared const ==================== */
// just serve for build&node, can't be use `await import(VIRTUAL_INDEX_CONFIG_PKG)` in client side
const VIRTUAL_INDEX_I18N_PKG = "virtual:index-i18n";
const VIRTUAL_INDEX_ADDITION_PKG = "virtual:index-addition";

export {
  ensureArray,
  escapeRegex,
  hasOwnProperty,
  resolveDefineAble,
  clearObject,
  VIRTUAL_INDEX_I18N_PKG,
  VIRTUAL_INDEX_ADDITION_PKG,
};
