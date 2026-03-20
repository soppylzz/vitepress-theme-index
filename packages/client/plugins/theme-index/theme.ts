import type { Ref } from "vue";
import { computed, reactive, ref, toRef } from "vue";
import { isUndefined, merge } from "lodash-unified";
import type { DeepRequired } from "@vitepress-theme-index/shared";
import type { EnhanceAppContext } from "vitepress";
import type { IndexClientThemeConfig, IndexResponse, IndexThemeMode } from "../../types";
import { indexClientThemeKey, indexThemeMode, indexPreset } from "../../types";

const defaultThemeConfig: DeepRequired<IndexClientThemeConfig> = {
  breakPoint: 768,
  font: {
    size: 16,
    family: "",
  },
  theme: {
    preset: "default",
    mode: "auto",
  },
};

function createResponsive(breakPoint: Ref<number>) {
  const width = ref(import.meta.env.SSR ? breakPoint.value : window.innerWidth);
  const update = () => {
    if (import.meta.env.SSR) return;
    width.value = window.innerWidth;
  };
  const response = computed<IndexResponse>(() =>
    width.value >= breakPoint.value ? "web" : "mobile"
  );
  return { response, update };
}

function createThemeAction(theme: DeepRequired<IndexClientThemeConfig>["theme"]) {
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

function installIndexTheme({ app }: EnhanceAppContext, config: IndexClientThemeConfig) {
  const resolved = merge({}, defaultThemeConfig, config) as DeepRequired<IndexClientThemeConfig>;
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

export { installIndexTheme };
