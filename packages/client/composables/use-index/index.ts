import type { BuildI18nViewConfig, IndexIcon, IndexLink } from "../../types";
import { indexSidebarKey, indexNavKey, indexClientThemeKey } from "../../types";
import { checkExternal, pascalCase } from "../../utils";
import { isObject, isString } from "lodash-unified";
import { normalizeLink } from "./utils";
import { computed, inject, toRefs } from "vue";
import { useI18n } from "../use-i18n";
import { useData, useRoute } from "vitepress";
import { hasOwnProperty } from "@vitepress-theme-index/shared";

function useIcon(icon: IndexIcon) {
  return !isString(icon)
    ? icon
    : icon.startsWith("VtiI") || icon.startsWith("vti-i-")
      ? pascalCase(icon)
      : `VtiI${pascalCase(icon)}`;
}

function useLink<T extends IndexLink>(link: T) {
  const { href, _target } = toRefs(link);
  const isExternal = computed(() => !!(checkExternal(href.value) || _target.value === "_blank"));
  const { site } = useData();

  const attr = computed(() => ({
    rel: isExternal.value ? "noreferrer" : undefined,
    href: href.value ? normalizeLink(site.value, href.value) : undefined,
    target: _target.value ?? (isExternal.value ? "_blank" : undefined),
  }));

  return { attr, isExternal };
}

function useIndex() {
  const theme = inject(indexClientThemeKey);
  const nav = inject(indexNavKey);
  const sidebar = inject(indexSidebarKey);

  if (!theme) throw new Error("useIndex must be used in layout");
  if (!nav) throw new Error("useIndexNav missing");
  if (!sidebar) throw new Error("useIndexSidebar missing");

  return { theme, nav, sidebar };
}

function useViewItems<T>(raw: BuildI18nViewConfig<T>, defaultVal: T) {
  const { localeIndex } = useI18n(); // 你的国际化 hook

  return computed<T>(() => {
    if (!isObject(raw) || !hasOwnProperty(raw, "i18n") || !raw.i18n) {
      return raw as T;
    }
    const items = raw.items as Record<string, T>;
    return items?.[localeIndex.value] ?? items?.root ?? defaultVal;
  });
}

function useViewItemsWithRoute<T>(
  raw: BuildI18nViewConfig<Record<string, T>>,
  defaultVal: Record<string, T>
) {
  const withRoute = useViewItems(raw, defaultVal);
  const route = useRoute();

  return computed(() => {
    return Object.fromEntries(
      Object.entries(withRoute.value).filter(([path, _]) => route.path.startsWith(path))
    );
  });
}

export { useIcon, useLink, useIndex, useViewItems, useViewItemsWithRoute };
