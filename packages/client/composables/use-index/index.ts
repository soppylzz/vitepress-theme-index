import type { IndexIcon, IndexLink } from "../../types";
import { indexNavKey, indexClientThemeKey } from "../../types";
import { checkExternal, pascalCase } from "../../utils";
import { isString } from "lodash-unified";
import { normalizeLink } from "./utils";
import { computed, inject, toRefs } from "vue";

function useIcon(icon: IndexIcon) {
  return !isString(icon)
    ? icon
    : icon.startsWith("VtiI") || icon.startsWith("vti-i-")
      ? pascalCase(icon)
      : `VtiI${pascalCase(icon)}`;
}

function useLink<T extends IndexLink>(link: T) {
  const { href, target } = toRefs(link);
  const isExternal = computed(() => !!(checkExternal(href.value) || target.value === "_blank"));

  const attr = computed(() => ({
    rel: isExternal.value ? "noreferrer" : undefined,
    href: href.value ? normalizeLink(href.value) : undefined,
    target: target.value ?? (isExternal.value ? "_blank" : undefined),
  }));

  return { attr, isExternal };
}

function useIndexTheme() {
  const ctx = inject(indexClientThemeKey);
  if (!ctx) throw new Error("useIndexTheme must be used in the layout");
  return ctx;
}

function useIndexNav() {
  const ctx = inject(indexNavKey);
  if (!ctx) throw new Error("useIndexNav must be used within IndexNavProvider");
  return ctx;
}

export { useIndexTheme, useIcon, useLink, useIndexNav };
