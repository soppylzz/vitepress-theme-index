import type {
  BuildI18nViewConfig,
  IndexIcon,
  IndexLink,
  IndexThemeDataset,
  IndexThemeMode,
} from "../../types";
import {
  indexNavKey,
  indexSidebarKey,
  indexSiteKey,
  indexThemeKey,
  indexGlobalKey,
} from "../../types";
import { checkExternal, normalizeLink, pascalCase, useSplitRefs } from "../../utils";
import { isObject, isString } from "lodash-unified";
import type { ComputedRef, MaybeRef, MaybeRefOrGetter } from "vue";
import { unref, watchEffect, computed, toValue } from "vue";
import { useI18n } from "../use-i18n";
import { useData, useRoute } from "vitepress";
import { hasOwnProperty } from "@vitepress-theme-index/shared";
import { useInject } from "../use-inject";

function useIcon(icon: IndexIcon) {
  return !isString(icon)
    ? icon
    : icon.startsWith("VtiI") || icon.startsWith("vti-i-")
      ? pascalCase(icon)
      : `VtiI${pascalCase(icon)}`;
}

function useLink<T extends IndexLink>(
  link?: MaybeRefOrGetter<T | null | undefined>,
  block: boolean = false
) {
  const { site } = useData();
  const rawLink = computed(() => toValue(link));

  const isExternal = computed(
    () => checkExternal(rawLink.value?.href) || rawLink.value?._target === "_blank"
  );

  const attr = computed(() =>
    block
      ? {}
      : {
          href: rawLink.value?.href ? normalizeLink(site.value, rawLink.value.href) : undefined,
          target: rawLink.value?._target ?? (isExternal.value ? "_blank" : undefined),
          rel: isExternal.value ? "noreferrer" : undefined,
        }
  );

  return { attr, isExternal };
}

function useMaybeI18nData<T, D extends T = undefined>(raw: BuildI18nViewConfig<T>, defaultVal?: D) {
  const { localeIndex } = useI18n();

  return computed(() => {
    if (!isObject(raw) || !hasOwnProperty(raw, "i18n") || !raw.i18n) {
      return raw as T;
    }
    const items = raw.items as Record<string, T>;
    return items?.[localeIndex.value] ?? items?.root ?? defaultVal;
  }) as ComputedRef<D extends undefined ? T | undefined : T>;
}

function useMaybeI18nDataWithRoute<T>(
  raw: BuildI18nViewConfig<Record<string, T>>,
  defaultVal: Record<string, T> = {}
) {
  const withRoute = useMaybeI18nData(raw, defaultVal);
  const route = useRoute();

  return computed(() => {
    if (!withRoute.value) return {};
    return Object.fromEntries(
      Object.entries(withRoute.value).filter(([path, _]) => route.path.startsWith(path))
    );
  });
}

function flatArrayWithRoute<T>(raw: Record<string, T[]>) {
  return Object.values(raw).flat() as T[];
}

const useNav = () => {
  const raw = useInject(indexNavKey);
  return useMaybeI18nData(raw, []);
};
const useSidebar = () => {
  const raw = useInject(indexSidebarKey);
  return useMaybeI18nDataWithRoute(raw);
};
const useSite = () => {
  const raw = useInject(indexSiteKey);
  const res = useMaybeI18nData(raw, {});
  return useSplitRefs(res);
};

const useTheme = () => useInject(indexThemeKey);
const useGlobal = () => useInject(indexGlobalKey);

function getComputedMode(mode: IndexThemeMode): Exclude<IndexThemeMode, "auto"> {
  if (mode !== "auto") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

let datasetCache: ComputedRef<IndexThemeDataset> | null = null;
function createComputedDataset() {
  if (datasetCache) return datasetCache;

  const { ctx } = useTheme();
  datasetCache = computed(() => {
    const { mode, preset } = ctx;
    return {
      mode: getComputedMode(mode),
      preset,
    };
  });
  return datasetCache;
}

function useThemeDataset(elRef: MaybeRef<HTMLElement | HTMLIFrameElement | null>) {
  const datasetRef = createComputedDataset();

  watchEffect(() => {
    const el = unref(elRef);
    if (!el) return;

    const { mode, preset } = datasetRef.value;
    el.setAttribute("data-preset", preset);
    el.setAttribute("data-mode", mode);
  });
}

export {
  useIcon,
  useLink,
  useNav,
  useTheme,
  useSite,
  useSidebar,
  flatArrayWithRoute,
  useThemeDataset,
  useGlobal,
};
