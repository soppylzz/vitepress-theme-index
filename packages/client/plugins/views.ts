import type { EnhanceAppContext, SiteData } from "vitepress";
import type { IndexClientConfig, IndexClientAdditionConfig, AdditionType } from "../types";
import { indexSiteKey, IndexSiteConfig, indexSidebarKey, indexNavKey } from "../types";
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

async function installAdditions(
  { siteData, app }: EnhanceAppContext,
  configs?: Pick<IndexClientConfig, AdditionType>
) {
  const configEntries = await collectLocalConfigs(siteData.value);

  const collectI18nItems = <T extends AdditionType>(field: T) => {
    const arrKeys = ["nav"];
    return Object.fromEntries(
      configEntries.map(([locale, config]) => [
        locale,
        config?.[field] ?? ((arrKeys.includes(field) ? [] : {}) as IndexClientAdditionConfig[T]),
      ])
    );
  };

  const makeAddition = <T extends AdditionType>(key: T) => {
    const value = configs?.[key];
    return isEmpty(value) ? { items: collectI18nItems(key), i18n: true } : value;
  };

  const installMap = [
    [indexNavKey, makeAddition("nav")],
    [indexSiteKey, makeAddition("site")],
    [indexSidebarKey, makeAddition("sidebar")],
  ];
  installMap.forEach(([key, val]) => {
    app.provide(key, val);
  });
}

export { installAdditions };
