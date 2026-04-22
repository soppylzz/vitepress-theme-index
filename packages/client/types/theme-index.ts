import type { ComputedRef, Reactive } from "vue";
import type { DeepPartial, DeepRequired } from "@vitepress-theme-index/shared";
import type { RMenuItemRecord, UserIndexRightMenuConfig } from "./right-menu";
import type { IndexNavConfig, NavItemConfig } from "./nav";
import type { IndexResponse, IndexTextLink } from "./global";
import type { BuildI18nViewConfig } from "./i18n";
import type { MenuItemConfig } from "./comps";
import type { GiscusProps, AvailableLanguage } from "@giscus/vue";

const indexPreset = ["default", "pixel-art"] as const;
const indexThemeMode = ["light", "auto", "dark"] as const;

type IndexPreset = (typeof indexPreset)[number];
type IndexThemeMode = (typeof indexThemeMode)[number];

interface IndexThemeDataset {
  preset: IndexPreset;
  mode: IndexThemeMode;
}

interface IndexThemeConfig extends IndexThemeDataset {
  breakPoint: [number, number];
  fontSize: number;
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

type UserIndexThemeConfig = DeepPartial<
  Omit<IndexThemeConfig, "breakPoint"> & {
    breakPoint: number | [number, number];
  }
>;

type ResolvedIndexThemeConfig = DeepRequired<IndexThemeConfig>;

interface IndexThemeContext extends ResolvedIndexThemeConfig {
  ctx: Reactive<ResolvedIndexThemeConfig>;
  response: ComputedRef<IndexResponse>;
  available: {
    preset: typeof indexPreset;
    mode: typeof indexThemeMode;
  };
  setPreset: (preset: IndexPreset) => void;
  setMode: (mode: IndexThemeMode) => void;
}

type AdditionType = keyof IndexAdditionConfig;
type IndexAdditionConfig = DeepPartial<{
  nav: NavItemConfig[];
  site: SiteConfig;
  sidebar: SidebarConfig;
}>;

interface GiscusInjectionFont {
  target: "text" | "code";
  src: string;
  type: string;
}

interface GiscusConfig extends GiscusProps {
  type: "giscus";
  localeMap: Record<string, AvailableLanguage>;
  fonts: Record<IndexPreset, GiscusInjectionFont[]>;
}

type IndexCommentConfig = GiscusConfig;

interface IndexGlobalConfig {
  comment: IndexCommentConfig;
}

type IndexClientConfig<Records extends RMenuItemRecord = RMenuItemRecord> = Partial<
  {
    rightMenu: UserIndexRightMenuConfig<Records>;
    theme: UserIndexThemeConfig;
    site: IndexSiteConfig;
    nav: IndexNavConfig;
    sidebar: IndexSidebarConfig;
  } & IndexGlobalConfig
>;

export { indexPreset, indexThemeMode };
export type {
  IndexPreset,
  IndexThemeMode,
  AdditionType,
  SiteConfig,
  IndexSiteConfig,
  IndexSidebarConfig,
  IndexClientConfig,
  IndexThemeConfig,
  IndexThemeContext,
  UserIndexThemeConfig,
  ResolvedIndexThemeConfig,
  IndexAdditionConfig,
  IndexThemeDataset,
  IndexGlobalConfig,
  GiscusConfig,
};
