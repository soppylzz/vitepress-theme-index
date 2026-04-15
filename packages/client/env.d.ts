declare module "virtual:index-i18n" {
  import type { I18NConfig, LocaleModule } from "@vitepress-theme-index/shared";
  export const data: LocaleModule;
  export const config: Pick<I18NConfig, "mode" | "rootLocale" | "datetimeFormats">;
}

declare module "virtual:index-addition" {
  import type { DefineAble } from "@vitepress-theme-index/shared";
  import type { IndexClientAdditionConfig } from "./types";
  export const configs: Record<string, DefineAble<IndexClientAdditionConfig>>;
}

declare module "virtual:index-archive" {
  import type { ArchiveAllStats } from "@vitepress-theme-index/shared";
  const stats: ArchiveAllStats;
  export default stats;
}

declare module "virtual:index-search" {
  import type { SearchIndex } from "@vitepress-theme-index/shared";
  const search: SearchIndex;
  export default search;
}

declare module "virtual:index-overall" {
  import type { PostInfo } from "@vitepress-theme-index/shared";
  const infos: PostInfo[];
  export default infos;
}
