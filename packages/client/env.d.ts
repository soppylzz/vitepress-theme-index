declare module "virtual:index-i18n" {
  import type { I18NConfig, LocaleModule } from "@vitepress-theme-index/shared";

  export const file: string | undefined;
  export const mode: I18NConfig["mode"];
  export const data: LocaleModule;
}

declare module "virtual:index-addition" {
  import type { DefineAble } from "@vitepress-theme-index/shared";
  import type { IndexClientAdditionConfig } from "./types";

  export const configs: Record<string, DefineAble<IndexClientAdditionConfig>>;
}
