import type { LocaleModule, LocaleMessages } from "@vitepress-theme-index/shared";
import type { SiteData } from "vitepress";
import { merge } from "lodash-unified";
import type { LocaleRouteItem, ResolvedLocaleRoutes, ResolvedLocales } from "../../types";
import { mode, data, file } from "virtual:index-i18n";

function resolveMessage(localeKey: string) {
  if (mode === "mixin") return data[localeKey] ?? {};
  const [, messages] = Object.entries(data).find(([p]) => p.endsWith(`${localeKey}/${file}`)) || [];
  return messages ?? {};
}

/* ==================== resolve ==================== */
async function resolveIndexLocales(
  siteData: SiteData,
  defaultMessage: LocaleMessages = {}
): Promise<ResolvedLocales & ResolvedLocaleRoutes> {
  const vpLocales = siteData.locales ?? {};
  const hasLocales = Object.keys(vpLocales).length > 0;
  const messages: LocaleModule = {};
  const routes: Record<string, LocaleRouteItem> = {};
  const localeKeys = hasLocales ? Object.keys(vpLocales) : ["root"];

  // iter localKeys, ensure each key has locales
  for (const localeIndex of localeKeys) {
    const localeMessages = resolveMessage(localeIndex);
    messages[localeIndex] = merge({}, defaultMessage, localeMessages);
    // build routes
    const localeConfig = vpLocales[localeIndex];
    routes[localeIndex] = {
      label: localeConfig?.label,
      link: localeConfig?.link ?? (localeIndex === "root" ? "/" : `/${localeIndex}/`),
    };
  }

  return {
    initialLocale: siteData.localeIndex || "root",
    messages,
    routes,
  };
}

export { resolveIndexLocales };
