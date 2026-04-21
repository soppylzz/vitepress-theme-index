import type { Ref } from "vue";
import { inject, onBeforeMount, onMounted, watch, computed, reactive, ref, toRef } from "vue";
import { isArray, isNumber, merge, omit, pick } from "lodash-unified";
import type { EnhanceAppContext } from "vitepress";
import type {
  IndexClientThemeConfig,
  IndexClientThemeContext,
  IndexPreset,
  IndexResponse,
  IndexThemeMode,
  ResolvedIndexClientThemeConfig,
  UserIndexClientThemeConfig,
} from "../../types";
import { indexThemeStoreKey, indexThemeKey, indexThemeMode, indexPreset } from "../../types";
import { isBrowser, pluginLogger } from "@vitepress-theme-index/shared";
import { getLocalStorage, setLocalStorage } from "../../utils";

const defaultThemeConfig = {
  breakPoint: [768, 1280],
  fontSize: 16,
  preset: "default",
  mode: "auto",
} as const satisfies ResolvedIndexClientThemeConfig;

function createResponsive(breakPoint: Ref<IndexClientThemeConfig["breakPoint"]>) {
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

let globalThemeContext: Record<string, any> | null = null;
function installTheme({ app }: EnhanceAppContext, config?: UserIndexClientThemeConfig) {
  if (globalThemeContext) {
    app.provide(indexThemeKey, globalThemeContext as IndexClientThemeContext);
    return;
  }

  const resolved = resolveIndexClientThemeConfig(config);
  const ctx = reactive(resolved);

  const { response, update } = createResponsive(toRef(ctx, "breakPoint"));
  const actions = createThemeAction(ctx);

  const themeContextValue = {
    ...resolved,
    ctx,
    response,
    update,
    ...actions,
  } as IndexClientThemeContext;

  globalThemeContext = themeContextValue;

  if (isBrowser()) {
    window.addEventListener("resize", update, { passive: true });
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

  const { update, ctx } = theme;
  onBeforeMount(() => {
    const cache =
      getLocalStorage<Pick<IndexClientThemeConfig, "preset" | "mode">>(indexThemeStoreKey);
    Object.assign(ctx, pick(cache, ["mode", "preset"]));

    watch(
      [() => ctx.mode, () => ctx.preset],
      ([mode, preset]) => {
        const root = document.documentElement;

        root.setAttribute("data-preset", preset);

        if (mode === "auto") {
          const query = window.matchMedia("(prefers-color-scheme: dark)");
          const autoMode = query.matches ? "dark" : "light";
          root.setAttribute("data-mode", autoMode);
        } else {
          root.setAttribute("data-mode", mode);
        }

        setLocalStorage(indexThemeStoreKey, { mode, preset });
      },
      { immediate: true }
    );
  });

  onMounted(() => {
    // resolve hydration mismatch problem
    // must resolve after first render
    update();
  });
}

export { installTheme, setupTheme };
