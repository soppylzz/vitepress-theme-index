import type { ComputedRef, Reactive } from "vue";
import type { DeepPartial, DeepRequired } from "@vitepress-theme-index/shared";
import type { RMenuItemRecord, UserIndexRightMenuConfig } from "./right-menu";
import type { IndexNavConfig, NavItemConfig } from "./nav";
import type { IndexResponse, IndexTextLink } from "./global";
import type { BuildI18nViewConfig } from "./i18n";
import type { MenuItemConfig } from "./comps";

const indexPreset = ["default", "pixel-art"] as const;
const indexThemeMode = ["auto", "light", "dark"] as const;

type IndexPreset = (typeof indexPreset)[number];
type IndexThemeMode = (typeof indexThemeMode)[number];

interface IndexClientThemeConfig {
  breakPoint: [number, number];
  fontSize: number;
  preset: IndexPreset;
  mode: IndexThemeMode;
}

type SidebarConfig = Record<string, MenuItemConfig[]>;

type SiteConfig = Partial<{
  siteName: string;
  build: number | string | Date;
  brand: string;
  beian: IndexTextLink;
  owner: IndexTextLink;
  license: IndexTextLink;
}>;

type IndexSiteConfig = BuildI18nViewConfig<SiteConfig>;
type IndexSidebarConfig = BuildI18nViewConfig<SidebarConfig>;

type UserIndexClientThemeConfig = DeepPartial<
  Omit<IndexClientThemeConfig, "breakPoint"> & {
    breakPoint: number | [number, number];
  }
>;

type ResolvedIndexClientThemeConfig = DeepRequired<IndexClientThemeConfig>;

interface IndexClientThemeContext extends ResolvedIndexClientThemeConfig {
  ctx: Reactive<ResolvedIndexClientThemeConfig>;
  response: ComputedRef<IndexResponse>;
  available: {
    preset: typeof indexPreset;
    mode: typeof indexThemeMode;
  };
  setPreset: (preset: IndexPreset) => void;
  setMode: (mode: IndexThemeMode) => void;
  update: () => void;
}

type AdditionType = keyof IndexClientAdditionConfig;
type IndexClientAdditionConfig = DeepPartial<{
  nav: NavItemConfig[];
  site: SiteConfig;
  sidebar: SidebarConfig;
}>;

type IndexClientConfig<Records extends RMenuItemRecord = RMenuItemRecord> = Partial<{
  rightMenu: UserIndexRightMenuConfig<Records>;
  theme: UserIndexClientThemeConfig;
  site: IndexSiteConfig;
  nav: IndexNavConfig;
  sidebar: IndexSidebarConfig;
}>;

export { indexPreset, indexThemeMode };
export type {
  IndexPreset,
  IndexThemeMode,
  AdditionType,
  SiteConfig,
  IndexSiteConfig,
  IndexSidebarConfig,
  IndexClientConfig,
  IndexClientThemeConfig,
  IndexClientThemeContext,
  UserIndexClientThemeConfig,
  ResolvedIndexClientThemeConfig,
  IndexClientAdditionConfig,
};
