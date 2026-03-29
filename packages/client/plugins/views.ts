import type { EnhanceAppContext, SiteData } from "vitepress";
import type { IndexClientConfig, IndexClientAdditionConfig } from "../types";
import { indexSidebarKey, indexNavKey } from "../types";
import { isEmpty, isFunction } from "lodash-unified";
import { configs } from "virtual:index-addition";

const getLocaleKey = (path: string) => {
  const segments = path.split("/").filter(Boolean);
  return segments.length <= 1 ? "root" : segments[0];
};

async function collectLocalConfigs(site: SiteData) {
  const vpLocales = site.locales ?? {};
  const localeKeys = Object.keys(vpLocales).length ? Object.keys(vpLocales) : ["root"];

  const keys = Object.keys(configs);
  const exts = Array.from(new Set(keys.map((k) => k.split(".").pop())));
  if (exts.length > 1) {
    throw new Error(`use only one ext for localConfig files, found: ${exts.join(", ")}`);
  }
  const result: Record<string, IndexClientAdditionConfig> = {};

  // iter modules, don't polyfill none addition config;
  for (const [localePath, modFn] of Object.entries(configs)) {
    const cfg = isFunction(modFn) ? await modFn() : modFn;
    const localeKey = getLocaleKey(localePath);
    if (!localeKeys.includes(localeKey)) continue;
    result[localeKey] = cfg;
  }
  return Object.entries(result);
}

type ViewTypes = "nav" | "sidebar";
async function installViews(
  { siteData, app }: EnhanceAppContext,
  configs?: Pick<IndexClientConfig, ViewTypes>
) {
  const configEntries = await collectLocalConfigs(siteData.value);
  const collectI18nItems = <T extends ViewTypes>(field: T) => {
    return Object.fromEntries(
      configEntries.map(([locale, config]) => [
        locale,
        config?.[field] ?? ((field === "nav" ? [] : {}) as IndexClientAdditionConfig[T]),
      ])
    );
  };

  const nav = isEmpty(configs?.nav) ? { items: collectI18nItems("nav"), i18n: true } : configs.nav;

  const sidebar = isEmpty(configs?.sidebar)
    ? { items: collectI18nItems("sidebar"), i18n: true }
    : configs.sidebar;

  app.provide(indexNavKey, nav);
  app.provide(indexSidebarKey, sidebar);
}

export { installViews };
