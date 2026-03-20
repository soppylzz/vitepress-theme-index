import { EXTERNAL_URL_RE } from "../../types";
import { useData, withBase } from "vitepress";
import { getCurrentInstance } from "vue";

// refer to vitepress default theme
function normalizeLink(url: string) {
  if (!url) return url;

  const isExternal = EXTERNAL_URL_RE.test(url);
  if (isExternal) return url;

  const { site } = useData();
  const { pathname, search, hash } = new URL(url, "http://a.com");

  const normalizedPath =
    pathname.endsWith("/") || pathname.endsWith(".html")
      ? url
      : url.replace(/(\.md)?$/, site.value.cleanUrls ? "" : ".html") + search + hash;

  return withBase(normalizedPath);
}

export { normalizeLink };
