import type { IndexIcon, IndexLink } from "../../types";
import { EXTERNAL_URL_RE, indexClientThemeKey } from "../../types";
import { pascalCase } from "../../utils";
import { isString } from "lodash-unified";
import { normalizeLink } from "./utils";
import { computed, inject, toRefs, unref } from "vue";

function useIcon(icon: IndexIcon) {
  return isString(icon)
    ? icon.startsWith("VtiI") || icon.startsWith("vti-i-")
      ? pascalCase(icon)
      : `VtiI${pascalCase(icon)}`
    : icon;
}

function useLink<T extends IndexLink>(link: T) {
  const { href, target } = link;
  const isExternal = !!((href && EXTERNAL_URL_RE.test(href)) || target === "_blank");

  const attr = {
    rel: isExternal ? "noreferrer" : undefined,
    href: href ? normalizeLink(href) : undefined,
    target: target ?? (isExternal ? "_blank" : undefined),
  };

  return { attr, isExternal };
}

function useIndexTheme() {
  const ctx = inject(indexClientThemeKey);
  if (!ctx) throw new Error("useIndexTheme must be used in the layout");
  return ctx;
}

export { useIndexTheme, useIcon, useLink };
