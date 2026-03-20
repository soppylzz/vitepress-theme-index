import type { MenuItemRecord, UserIndexRightMenuConfig } from "./right-menu";
import type { ComputedRef, InjectionKey, Reactive } from "vue";
import type { DeepRequired } from "@vitepress-theme-index/shared";
import type { IndexResponse } from "./global";
import type { IndexNavConfig } from "./views";

const indexPreset = ["default", "glass"] as const;
const indexThemeMode = ["auto", "light", "dark"] as const;

type IndexPreset = (typeof indexPreset)[number];
type IndexThemeMode = (typeof indexThemeMode)[number];

interface IndexClientThemeConfig {
  breakPoint: number;
  font: {
    size: number;
    family: string;
  };
  theme: {
    preset: IndexPreset;
    mode: IndexThemeMode;
  };
}

interface IndexClientThemeContext extends DeepRequired<IndexClientThemeConfig> {
  ctx: Reactive<DeepRequired<IndexClientThemeConfig>>;
  response: ComputedRef<IndexResponse>;
  set<K extends keyof IndexClientThemeConfig["theme"]>(
    key: K,
    val: IndexClientThemeConfig["theme"][K]
  ): void;
  cycle<K extends keyof IndexClientThemeConfig["theme"]>(key: K, step: -1 | 1): void;
}

const indexClientThemeKey: InjectionKey<IndexClientThemeContext> =
  Symbol("indexClientThemeContext");

type IndexClientConfig<Records extends MenuItemRecord> = Partial<{
  rightMenu: UserIndexRightMenuConfig<Records>;
  theme: IndexClientThemeConfig;
  nav: IndexNavConfig;
}>;

export { indexPreset, indexThemeMode, indexClientThemeKey };
export type {
  IndexPreset,
  IndexThemeMode,
  IndexClientConfig,
  IndexClientThemeConfig,
  IndexClientThemeContext,
};
