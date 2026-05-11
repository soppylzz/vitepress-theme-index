import type { Ref } from "vue";
import { computed, inject, onBeforeMount, onMounted, reactive, ref, toRef, watch } from "vue";
import { isArray, isNumber, merge, omit, pick } from "lodash-unified";
import type { EnhanceAppContext } from "vitepress";
import { indexPreset, indexThemeKey, indexThemeMode, indexThemeStoreKey } from "../../types";
import type {
  IndexPreset,
  IndexResponse,
  IndexThemeConfig,
  IndexThemeContext,
  IndexThemeData,
  IndexThemeMode,
  ResolvedIndexThemeConfig,
  UserIndexThemeConfig,
} from "../../types";
import { isBrowser, pluginLogger } from "@vitepress-theme-index/shared";
import { getLocalStorage, setLocalStorage } from "../../utils";
import { defaultThemeConfig } from "./default";

function createResponsive(breakPoint: Ref<IndexThemeConfig["breakPoint"]>) {
  const width = ref<number | null>(null);

  const update = () => {
    if (!isBrowser()) return;
    width.value = window.innerWidth;
  };

  const response = computed<IndexResponse>(() => {
    if (width.value === null) {
      return "desktop";
    }
    const w = width.value;
    return w < breakPoint.value[0] ? "mobile" : w > breakPoint.value[1] ? "desktop" : "pad";
  });
  return { response, update };
}

function createThemeAction(theme: IndexThemeConfig) {
  const available = {
    preset: indexPreset,
    mode: indexThemeMode,
  };
  const setPreset = (preset: IndexPreset) => {
    theme.preset = preset;
  };
  const setMode = (mode: IndexThemeMode) => {
    theme.mode = mode;
  };
  return { available, setPreset, setMode };
}

function isValidBreakPoint(breakPoint: IndexThemeConfig["breakPoint"]) {
  if (!isArray(breakPoint)) return true;
  if (breakPoint.length !== 2) return true;
  return !(
    isNumber(breakPoint[0]) &&
    isNumber(breakPoint[1]) &&
    breakPoint[0] < breakPoint[1] &&
    breakPoint[0] >= 0
  );
}

function resolveIndexClientThemeConfig(config?: UserIndexThemeConfig): ResolvedIndexThemeConfig {
  const merged = merge({}, defaultThemeConfig, omit(config, "breakPoint"));
  const breakPoint = isArray(config?.breakPoint)
    ? config.breakPoint
    : defaultThemeConfig.breakPoint;

  if (isValidBreakPoint(breakPoint)) {
    pluginLogger.error("breakPoint must be a [number, number] increasingly");
  }
  Object.assign(merged, { breakPoint });
  return merged as ResolvedIndexThemeConfig;
}

let updateFn: ReturnType<typeof createResponsive>["update"] | null = null;

function installTheme({ app }: EnhanceAppContext, config?: UserIndexThemeConfig) {
  const resolved = resolveIndexClientThemeConfig(config);
  const ctx = reactive(resolved);

  const { response, update } = createResponsive(toRef(ctx, "breakPoint"));
  const actions = createThemeAction(ctx);

  const themeContextValue = {
    ...resolved,
    ctx,
    response,
    ...actions,
  } as IndexThemeContext;

  updateFn = update;
  if (isBrowser()) {
    window.addEventListener("resize", update);
    app.onUnmount(() => {
      window.removeEventListener("resize", update);
    });
  }
  app.provide(indexThemeKey, themeContextValue);
}

function setupTheme() {
  const theme = inject(indexThemeKey);
  if (!theme) {
    pluginLogger.error("setupTheme failed");
  }

  const { ctx } = theme;
  onBeforeMount(() => {
    const cache = getLocalStorage<IndexThemeData>(indexThemeStoreKey);
    Object.assign(ctx, pick(cache, ["mode", "preset"]));
    watch(
      [() => ctx.mode, () => ctx.preset],
      ([mode, preset]) => {
        setLocalStorage(indexThemeStoreKey, { mode, preset });
      },
      { immediate: true }
    );
  });

  onMounted(() => {
    updateFn?.();
  });
}

export { installTheme, setupTheme };
