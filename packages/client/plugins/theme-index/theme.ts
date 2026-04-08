import type { Ref } from "vue";
import { computed, reactive, ref, toRef } from "vue";
import { isArray, isNumber, merge, omit } from "lodash-unified";
import type { EnhanceAppContext } from "vitepress";
import type {
  IndexClientThemeConfig,
  IndexResponse,
  ResolvedIndexClientThemeConfig,
  UserIndexClientThemeConfig,
} from "../../types";
import { indexClientThemeKey, indexThemeMode, indexPreset } from "../../types";
import { pluginLogger } from "@vitepress-theme-index/shared";

const defaultThemeConfig = {
  breakPoint: [768, 1280],
  font: {
    size: 16,
    family: "",
  },
  theme: {
    preset: "default",
    mode: "auto",
  },
} as const satisfies ResolvedIndexClientThemeConfig;

function createResponsive(breakPoint: Ref<IndexClientThemeConfig["breakPoint"]>) {
  const width = ref<number>(import.meta.env.SSR ? breakPoint.value[0] : window.innerWidth);
  const update = () => {
    if (import.meta.env.SSR) return;
    width.value = window.innerWidth;
  };
  const response = computed<IndexResponse>(() => {
    const w = width.value;
    return w < breakPoint.value[0] ? "mobile" : w > breakPoint.value[1] ? "desktop" : "pad";
  });
  return { response, update };
}

function createThemeAction(theme: IndexClientThemeConfig["theme"]) {
  const available: Record<keyof typeof theme, string[]> = {
    mode: [...indexThemeMode],
    preset: [...indexPreset],
  };
  const set = <K extends keyof IndexClientThemeConfig["theme"]>(key: K, val: (typeof theme)[K]) =>
    (theme[key] = val);
  const cycle = <K extends keyof IndexClientThemeConfig["theme"]>(key: K, step: -1 | 1) => {
    const list = available[key];
    const current = theme[key];
    theme[key] = list[(list.indexOf(current) + step + list.length) % list.length] as any;
  };
  return { set, cycle };
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
  const actions = createThemeAction(ctx.theme);

  if (!import.meta.env.SSR) {
    window.addEventListener("resize", update, { passive: true });
    app.onUnmount(() => {
      window.removeEventListener("resize", update);
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
