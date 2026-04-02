import type { LocaleModule } from "@vitepress-theme-index/shared";

interface LocaleRouteItem {
  label: string;
  link: string;
}
interface ResolvedLocaleRoutes {
  routes: Record<string, LocaleRouteItem>;
}
interface ResolvedLocales {
  initialLocale: string;
  messages: LocaleModule;
}

type BuildI18nViewConfig<T> = T | { i18n: boolean; items: Record<string, T> };
export type { LocaleRouteItem, ResolvedLocaleRoutes, ResolvedLocales, BuildI18nViewConfig };
