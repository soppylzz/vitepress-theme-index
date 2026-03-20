import type { LocaleModule } from "@vitepress-theme-index/shared";
import type { InjectionKey } from "vue";

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

const indexI18nKey: InjectionKey<ResolvedLocaleRoutes> = Symbol("INDEX_I18N_CONTEXT");

export { indexI18nKey };
export type { LocaleRouteItem, ResolvedLocaleRoutes, ResolvedLocales };
