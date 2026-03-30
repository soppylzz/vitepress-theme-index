import { EXTERNAL_URL_RE, INTERNAL_ABS_URL_RE } from "../types";

function checkExternal(url?: string) {
  return !!(url && EXTERNAL_URL_RE.test(url));
}

function checkInternalAbs(url?: string) {
  return !!(url && INTERNAL_ABS_URL_RE.test(url));
}

function indexToPrefix(index: string) {
  return index === "root" ? "/" : `/${index}/`;
}

function withPrefix(prefix: string, path: string): string {
  if (!prefix) return path;
  if (!path) return prefix;
  const cleanBase = prefix.replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
}

export { checkExternal, checkInternalAbs, indexToPrefix, withPrefix };
