declare module "virtual:index-i18n" {
  import type { I18NConfig, LocaleModule } from "@vitepress-theme-index/shared";
  export const data: LocaleModule;
  export const config: Pick<I18NConfig, "mode" | "rootLocale" | "datetimeFormats">;
}

declare module "virtual:index-addition" {
  import type { DefineAble } from "@vitepress-theme-index/shared";
  import type { IndexAdditionConfig } from "./types";
  export const configs: Record<string, DefineAble<IndexAdditionConfig>>;
}

declare module "virtual:index-archive" {
  import type { LocaleArchiveStatsRecord } from "@vitepress-theme-index/shared";
  const localeStats: LocaleArchiveStatsRecord;
  export default localeStats;
}

declare module "virtual:index-search" {
  import type { LocaleSearchIndexRecord } from "@vitepress-theme-index/shared";
  const localeSearch: LocaleSearchIndexRecord;
  export default localeSearch;
}

declare module "virtual:index-overall" {
  import type { PostInfo } from "@vitepress-theme-index/shared";
  const infos: PostInfo[];
  export default infos;
}

declare module "*?worker" {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}
