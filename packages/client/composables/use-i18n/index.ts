import type { ComputedRef } from "vue";
import { computed, inject, readonly } from "vue";
import { useI18n as useVueI18n } from "vue-i18n";
import { useData } from "vitepress";
import { isFunction, isString } from "lodash-unified";
import type { IndexText, ResolvedLocaleRoutes } from "../../types";
import { indexI18nKey } from "../../types";

function useI18n() {
  const { routes } = inject(indexI18nKey)!;
  const { t } = useVueI18n();

  const { site, localeIndex, hash, page } = useData();
  const translate = (key: string, plural?: number) => t(key, plural);

  // routes generate
  const getPrefix = (idx: string) => (idx === "root" ? "/" : `/${idx}/`);

  const currentRoutes: ComputedRef<ResolvedLocaleRoutes["routes"]> = computed(() => {
    // realize refer to vitepress defaultTheme
    const computedRoutes: ResolvedLocaleRoutes["routes"] = {};
    const curPrefix = getPrefix(localeIndex.value);
    const addExt = !site.value.cleanUrls;

    for (const [idx, item] of Object.entries(routes)) {
      // `page.value.relativePath` is not startWith "/"
      const normRelPath = page.value.relativePath
        .slice(curPrefix.length - 1)
        .replace(/(^|\/)index\.md$/, "$1")
        .replace(/\.md$/, addExt ? ".html" : "");

      computedRoutes[idx] = {
        ...item,
        link: getPrefix(idx) + normRelPath + hash.value,
      };
    }
    return computedRoutes;
  });

  return {
    localeIndex: readonly(localeIndex),
    currentRoutes,
    t: translate,
  };
}

function useText(text?: IndexText) {
  const { t } = useVueI18n();
  return isString(text) ? text : isFunction(text) ? text(t) : "";
}

export { useI18n, useText };
