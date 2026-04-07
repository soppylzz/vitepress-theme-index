import { EXTERNAL_URL_RE, INTERNAL_ABS_URL_RE } from "../types";
import type { SiteData } from "vitepress";
import { withBase } from "vitepress";

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

function normalizeLink(site: SiteData, url: string) {
  if (!url) return url;
  if (checkExternal(url)) return url;

  const { pathname, search, hash } = new URL(url, "http://a.com");
  // outside of setup, use indexToPrefix build indexPrefix
  const localePrefix = indexToPrefix(site.localeIndex?.trim() ?? "root");
  const prefixed = !checkInternalAbs(url)
    ? url
    : withPrefix("/", url).startsWith(localePrefix)
      ? withPrefix("/", url)
      : withPrefix(localePrefix, url);

  const normalizedPath =
    pathname.endsWith("/") || pathname.endsWith(".html")
      ? prefixed
      : prefixed.replace(/(\.md)?$/, site.cleanUrls ? "" : ".html") + search + hash;

  return withBase(normalizedPath);
}

export { checkExternal, checkInternalAbs, indexToPrefix, withPrefix, normalizeLink };
