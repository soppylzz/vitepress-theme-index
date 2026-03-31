import type { ComputedRef, InjectionKey, Reactive } from "vue";
import type { DeepPartial, DeepRequired } from "@vitepress-theme-index/shared";
import type { RMenuItemRecord, UserIndexRightMenuConfig } from "./right-menu";
import type { IndexNavConfig, IndexSidebarConfig, NavItemConfig, SidebarItemConfig } from "./views";
import type { IndexResponse } from "./global";

const indexPreset = ["default", "glass"] as const;
const indexThemeMode = ["auto", "light", "dark"] as const;

type IndexPreset = (typeof indexPreset)[number];
type IndexThemeMode = (typeof indexThemeMode)[number];

interface IndexClientThemeConfig {
  breakPoint: [number, number];
  font: {
    size: number;
    family: string;
  };
  theme: {
    preset: IndexPreset;
    mode: IndexThemeMode;
  };
}

type UserIndexClientThemeConfig = DeepPartial<
  Omit<IndexClientThemeConfig, "breakPoint"> & { breakPoint: number | [number, number] }
>;

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

type IndexClientAdditionConfig = DeepPartial<{
  nav: NavItemConfig[];
  sidebar: Record<string, SidebarItemConfig[]>;
}>;

type IndexClientConfig<Records extends RMenuItemRecord = RMenuItemRecord> = Partial<{
  rightMenu: UserIndexRightMenuConfig<Records>;
  theme: UserIndexClientThemeConfig;
  nav: IndexNavConfig;
  sidebar: IndexSidebarConfig;
}>;

export { indexPreset, indexThemeMode, indexClientThemeKey };
export type {
  IndexPreset,
  IndexThemeMode,
  IndexClientConfig,
  IndexClientThemeConfig,
  IndexClientThemeContext,
  UserIndexClientThemeConfig,
  IndexClientAdditionConfig,
};
