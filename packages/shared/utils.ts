import type { DefineAble } from "./types";
import { camelCase, isFunction, upperFirst } from "lodash-unified";
import CryptoJS from "crypto-js";

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
  Object.keys(obj).forEach((key) => delete (obj as any)[key]);
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

function createMD5Hash(str: string): string {
  return CryptoJS.MD5(str).toString();
}

function pascalCase(str: string) {
  return upperFirst(camelCase(str));
}

export {
  ensureArray,
  escapeRegex,
  hasOwnProperty,
  resolveDefineAble,
  clearObject,
  createMD5Hash,
  pascalCase,
  isBrowser,
  isNode,
};
