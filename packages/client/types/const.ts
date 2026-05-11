import type { InjectionKey } from "vue";
import type { ResolvedLocaleRoutes } from "./i18n";
import type { IndexGlobalConfig, IndexThemeContext, WithLocaleDiffConfig } from "./theme-index";
import type { LNavContext, MenuContext } from "./comps";
import type { LocaleArchiveStatsRecord, PostInfo } from "@vitepress-theme-index/shared";
import type { IndexMenuGlobalContext, IndexMenuProvideContext } from "./right-menu";

/* =============== store keys =============== */
const indexThemeStoreKey: string = "indexThemeStoreKey";
const indexSearchStoreKey: string = "indexSearchStoreKey";

/* =============== inject keys =============== */
const indexI18nKey: InjectionKey<ResolvedLocaleRoutes> = Symbol("indexI18nKey");

const indexThemeKey: InjectionKey<IndexThemeContext> = Symbol("indexThemeKey");
const indexGlobalKey: InjectionKey<IndexGlobalConfig> = Symbol("indexGlobalKey");

const indexNavKey: InjectionKey<WithLocaleDiffConfig["nav"]> = Symbol("indexNavKey");
const indexSiteKey: InjectionKey<WithLocaleDiffConfig["site"]> = Symbol("indexSiteKey");
const indexSidebarKey: InjectionKey<WithLocaleDiffConfig["sidebar"]> = Symbol("indexSidebarKey");

const indexOverallKey: InjectionKey<PostInfo[]> = Symbol("indexOverallKey");
const indexArchiveKey: InjectionKey<LocaleArchiveStatsRecord> = Symbol("indexArchiveKey");

const indexRightMenuGlobalKey: InjectionKey<IndexMenuGlobalContext> =
  Symbol("indexRightMenuGlobalKey");
const indexRightMenuProvideKey: InjectionKey<IndexMenuProvideContext> = Symbol(
  "indexRightMenuProvideKey"
);

/* =============== local keys =============== */
const localLNavKey: InjectionKey<LNavContext | null> = Symbol("localLNavKey");
const localMenuKey: InjectionKey<MenuContext | null> = Symbol("localMenuKey");
const localRightMenuKey: InjectionKey<string | null> = Symbol("localRightMenuKey");

/* =============== r-menu const =============== */
const navSeparator = "/";
const rightMenuNavScope = "index-rm-nav";
const rightMenuItemScope = "index-rm-item";

export {
  indexThemeStoreKey,
  indexSearchStoreKey,
  indexI18nKey,
  indexThemeKey,
  indexGlobalKey,
  indexNavKey,
  indexSiteKey,
  indexSidebarKey,
  indexOverallKey,
  indexArchiveKey,
  indexRightMenuGlobalKey,
  indexRightMenuProvideKey,
  localMenuKey,
  localLNavKey,
  localRightMenuKey,
  navSeparator,
  rightMenuNavScope,
  rightMenuItemScope,
};
