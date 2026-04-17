import type { Ref } from "vue";
import { nextTick, computed, reactive, ref, toRef } from "vue";
import { isArray, isNumber, merge, omit } from "lodash-unified";
import type { EnhanceAppContext } from "vitepress";
import type {
  IndexClientThemeConfig,
  IndexPreset,
  IndexResponse,
  IndexThemeMode,
  ResolvedIndexClientThemeConfig,
  UserIndexClientThemeConfig,
} from "../../types";
import { indexClientThemeKey, indexThemeMode, indexPreset } from "../../types";
import { isBrowser, pluginLogger } from "@vitepress-theme-index/shared";

const defaultThemeConfig = {
  breakPoint: [768, 1280],
  fontSize: 16,
  preset: "default",
  mode: "auto",
} as const satisfies ResolvedIndexClientThemeConfig;

function createResponsive(breakPoint: Ref<IndexClientThemeConfig["breakPoint"]>) {
  const width = ref<number>(!isBrowser() ? breakPoint.value[0] : window.innerWidth);
  const update = () => {
    if (!isBrowser()) return;
    width.value = window.innerWidth;
  };
  const response = computed<IndexResponse>(() => {
    const w = width.value;
    return w < breakPoint.value[0] ? "mobile" : w > breakPoint.value[1] ? "desktop" : "pad";
  });
  return { response, update };
}

function createThemeAction(theme: IndexClientThemeConfig) {
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

function isValidBreakPoint(breakPoint: IndexClientThemeConfig["breakPoint"]) {
  if (!isArray(breakPoint)) return true;
  if (breakPoint.length !== 2) return true;
  return !(
    isNumber(breakPoint[0]) &&
    isNumber(breakPoint[1]) &&
    breakPoint[0] < breakPoint[1] &&
    breakPoint[0] >= 0
  );
}

function resolveIndexClientThemeConfig(
  config?: UserIndexClientThemeConfig
): ResolvedIndexClientThemeConfig {
  const merged = merge({}, defaultThemeConfig, omit(config, "breakPoint"));
  const breakPoint = isArray(config?.breakPoint)
    ? config.breakPoint
    : defaultThemeConfig.breakPoint;

  if (isValidBreakPoint(breakPoint)) {
    pluginLogger.error("breakPoint must be a [number, number] increasingly");
  }
  Object.assign(merged, { breakPoint });
  return merged as ResolvedIndexClientThemeConfig;
}

function installTheme({ app }: EnhanceAppContext, config?: UserIndexClientThemeConfig) {
  const resolved = resolveIndexClientThemeConfig(config);
  const ctx = reactive(resolved);

  const { response, update } = createResponsive(toRef(ctx, "breakPoint"));
  const actions = createThemeAction(ctx);

  if (isBrowser()) {
    nextTick(() => {
      update();
      window.addEventListener("resize", update, { passive: true });
      app.onUnmount(() => {
        window.removeEventListener("resize", update);
      });
    });
  }

  app.provide(indexClientThemeKey, {
    ctx,
    response,
    ...resolved,
    ...actions,
  });
}

export { installTheme };
