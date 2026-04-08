import type {
  LocaleModule,
  LocaleMessages,
  I18NConfig,
  I18nDatetimeFormatSchema,
} from "@vitepress-theme-index/shared";
import type { SiteData } from "vitepress";
import { escapeRegExp, merge } from "lodash-unified";
import type { LocaleRouteItem, ResolvedLocaleRoutes, ResolvedLocales } from "../../types";
import { config, data } from "virtual:index-i18n";
import { indexToPrefix } from "../../utils";

function resolveMessage(localeKey: string) {
  if (config.mode === "mixin") return data[localeKey] ?? {};
  const regExp = new RegExp(`^${escapeRegExp(indexToPrefix(localeKey))}[^/]+\\.[^/]+$`);
  const [, messages] = Object.entries(data).find(([p]) => regExp.test(p)) || [];
  return messages ?? {};
}

function mapLocaleKey(localeKey: string) {
  return localeKey === "root" ? config.rootLocale : localeKey;
}

function mapLocaleObj<T>(obj?: Record<string, T>) {
  return Object.fromEntries(
    Object.entries(obj ?? {}).map(([key, val]) => [mapLocaleKey(key), val])
  );
}

/* ==================== resolve ==================== */
async function resolveIndexLocales(
  siteData: SiteData,
  defaultMessage: LocaleMessages,
  defaultDateFormat: I18nDatetimeFormatSchema
): Promise<ResolvedLocales & ResolvedLocaleRoutes & Pick<I18NConfig, "datetimeFormats">> {
  const vpLocales = siteData.locales ?? {};
  const hasLocales = Object.keys(vpLocales).length > 0;
  const routes: Record<string, LocaleRouteItem> = {};
  const localeKeys = hasLocales ? Object.keys(vpLocales) : ["root"];

  const messages: LocaleModule = {};
  const dateFormats: I18NConfig["datetimeFormats"] = {};

  // iter localKeys, ensure each key has locales
  for (const localeIndex of localeKeys) {
    // build vue-i18n needs
    messages[localeIndex] = merge({}, defaultMessage, resolveMessage(localeIndex));
    dateFormats[localeIndex] = config.datetimeFormats?.[localeIndex] ?? defaultDateFormat;

    // build routes
    const localeConfig = vpLocales[localeIndex];
    routes[localeIndex] = {
      label: localeConfig?.label,
      // outside of setup, can't use useI18n().indexPrefix
      link: localeConfig?.link ?? indexToPrefix(localeIndex),
    };
  }

  return {
    initialLocale: mapLocaleKey(siteData.localeIndex || "root"),
    datetimeFormats: mapLocaleObj(dateFormats),
    messages: mapLocaleObj(messages),
    routes,
  };
}

export { resolveIndexLocales, mapLocaleKey };
