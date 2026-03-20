declare module "virtual:index-config" {
  import type { ResolvedIndexConfig } from "@vitepress-theme-index/shared";
  const config: ResolvedIndexConfig;
  export default config;
}

declare module "virtual:index-locale" {
  import type { LocaleModule } from "@vitepress-theme-index/shared";
  const locale: LocaleModule;
  export default locale;
}
