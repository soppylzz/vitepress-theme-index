import type { InjectionKey } from "vue";
import type { ResolvedLocaleRoutes } from "./i18n";
import type { IndexNavConfig } from "./nav";
import type { IndexClientThemeContext, IndexSidebarConfig, IndexSiteConfig } from "./theme-index";
import type { ArchiveAllStats, PostInfo, SearchIndex } from "@vitepress-theme-index/shared";

const indexI18nKey: InjectionKey<ResolvedLocaleRoutes> = Symbol("INDEX_I18N_CONTEXT");
const indexClientThemeKey: InjectionKey<IndexClientThemeContext> =
  Symbol("indexClientThemeContext");

const indexSiteKey: InjectionKey<IndexSiteConfig> = Symbol("indexSiteKey");
const indexNavKey: InjectionKey<IndexNavConfig> = Symbol("indexNavContentKey");
const indexSidebarKey: InjectionKey<IndexSidebarConfig> = Symbol("indexSidebarKey");

const indexSearchKey: InjectionKey<SearchIndex> = Symbol("indexSearchKey");
const indexArchiveKey: InjectionKey<ArchiveAllStats> = Symbol("indexArchiveKey");
const indexOverallKey: InjectionKey<PostInfo[]> = Symbol("indexOverallKey");

export {
  indexI18nKey,
  indexClientThemeKey,
  indexSiteKey,
  indexNavKey,
  indexSidebarKey,
  indexArchiveKey,
  indexSearchKey,
  indexOverallKey,
};
