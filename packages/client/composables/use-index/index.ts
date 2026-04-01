import type { BuildI18nViewConfig, IndexIcon, IndexLink } from "../../types";
import { indexSiteKey, indexSidebarKey, indexNavKey, indexClientThemeKey } from "../../types";
import { checkExternal, pascalCase } from "../../utils";
import { isObject, isString } from "lodash-unified";
import { normalizeLink } from "./utils";
import { computed, inject, toRefs, unref } from "vue";
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
  const { site } = useData();
  const rawLink = computed(() => unref(link));

  const isExternal = computed(
    () => !!(checkExternal(rawLink.value.href) || rawLink.value._target === "_blank")
  );

  const attr = computed(() => ({
    href: rawLink.value.href ? normalizeLink(site.value, rawLink.value.href) : undefined,
    target: rawLink.value._target ?? (isExternal.value ? "_blank" : undefined),
    rel: isExternal.value ? "noreferrer" : undefined,
  }));

  return { attr, isExternal };
}

function useIndex() {
  const nav = inject(indexNavKey);
  const theme = inject(indexClientThemeKey);
  const sidebar = inject(indexSidebarKey);
  const site = inject(indexSiteKey);

  if (!nav || !sidebar || !theme || !site) {
    throw new Error("unable to find Index data");
  }
  return { theme, nav, sidebar, site };
}

function useMaybeI18nData<T>(raw: BuildI18nViewConfig<T>, defaultVal: T) {
  const { localeIndex } = useI18n(); // 你的国际化 hook

  return computed<T>(() => {
    if (!isObject(raw) || !hasOwnProperty(raw, "i18n") || !raw.i18n) {
      return raw as T;
    }
    const items = raw.items as Record<string, T>;
    return items?.[localeIndex.value] ?? items?.root ?? defaultVal;
  });
}

function useMaybeI18nDataWithRoute<T>(
  raw: BuildI18nViewConfig<Record<string, T>>,
  defaultVal: Record<string, T>
) {
  const withRoute = useMaybeI18nData(raw, defaultVal);
  const route = useRoute();

  return computed(() => {
    return Object.fromEntries(
      Object.entries(withRoute.value).filter(([path, _]) => route.path.startsWith(path))
    );
  });
}

export { useIcon, useLink, useIndex, useMaybeI18nData, useMaybeI18nDataWithRoute };
