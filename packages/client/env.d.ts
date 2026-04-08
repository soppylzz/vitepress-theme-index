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
  import type { IndexPostArchives } from "@vitepress-theme-index/shared";
  const archives: Record<string, IndexPostArchives>;
  export default archives;
}

declare module "virtual:index-search" {
  import type { IndexSearchIndex } from "@vitepress-theme-index/shared";
  const searchIndex: IndexSearchIndex;
  export default searchIndex;
}
