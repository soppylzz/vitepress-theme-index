import type { SiteData } from "vitepress";
import { withBase } from "vitepress";
import { checkExternal, checkInternalAbs, indexToPrefix, withPrefix } from "../../utils";

// refer to vitepress default theme
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

export { normalizeLink };
