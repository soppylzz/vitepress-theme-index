import type { UserIndexThemeConfig } from "./theme";
import type { RMenuItemRecord, UserIndexRightMenuConfig } from "../right-menu";
import type { IndexSearchConfig } from "../search";
import type { IndexTextLink } from "../global";
import type { BuildI18nViewConfig } from "../i18n";
import type { IndexCommentConfig, MenuItemConfig, NavItemConfig } from "../comps";
import type { DeepPartial } from "@vitepress-theme-index/shared";

/* =============== locale-diff =============== */
type NavConfig = NavItemConfig[];
type SidebarConfig = Record<string, MenuItemConfig[]>;
type SiteConfig = Partial<{
  siteName: string;
  build: number | string | Date;
  brand: string;
  beian: IndexTextLink;
  owner: IndexTextLink;
  license: IndexTextLink;
}>;
type LocaleOriginConfigs = {
  nav: NavConfig;
  site: SiteConfig;
  sidebar: SidebarConfig;
};

type AdditionType = keyof IndexAdditionConfig;
type IndexAdditionConfig = DeepPartial<LocaleOriginConfigs>;

/* =============== global =============== */
type WithLocaleDiffConfig = {
  [K in keyof LocaleOriginConfigs]: BuildI18nViewConfig<LocaleOriginConfigs[K]>;
};

interface IndexGlobalConfig {
  search: IndexSearchConfig;
  comment: IndexCommentConfig;
}

type IndexClientConfig<Records extends RMenuItemRecord = RMenuItemRecord> = Partial<
  {
    theme: UserIndexThemeConfig;
    rightMenu: UserIndexRightMenuConfig<Records>;
  } & WithLocaleDiffConfig &
    IndexGlobalConfig
>;

export * from "./theme";
export type {
  AdditionType,
  IndexAdditionConfig,
  WithLocaleDiffConfig,
  IndexClientConfig,
  IndexGlobalConfig,
};
