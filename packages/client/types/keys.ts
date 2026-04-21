import type { InjectionKey } from "vue";
import type { ResolvedLocaleRoutes } from "./i18n";
import type { IndexNavConfig } from "./nav";
import type { IndexClientThemeContext, IndexSidebarConfig, IndexSiteConfig } from "./theme-index";
import type { LocaleArchiveStatsRecord, PostInfo } from "@vitepress-theme-index/shared";

const indexI18nKey: InjectionKey<ResolvedLocaleRoutes> = Symbol("INDEX_I18N_CONTEXT");
const indexThemeKey: InjectionKey<IndexClientThemeContext> = Symbol("indexThemeContext");

const indexSiteKey: InjectionKey<IndexSiteConfig> = Symbol("indexSiteKey");
const indexNavKey: InjectionKey<IndexNavConfig> = Symbol("indexNavContentKey");
const indexSidebarKey: InjectionKey<IndexSidebarConfig> = Symbol("indexSidebarKey");

const indexArchiveKey: InjectionKey<LocaleArchiveStatsRecord> = Symbol("indexArchiveKey");
const indexOverallKey: InjectionKey<PostInfo[]> = Symbol("indexOverallKey");

const indexThemeStoreKey = "indexThemeStoreKey";

export {
  indexI18nKey,
  indexThemeKey,
  indexSiteKey,
  indexNavKey,
  indexSidebarKey,
  indexArchiveKey,
  indexOverallKey,
  indexThemeStoreKey,
};
