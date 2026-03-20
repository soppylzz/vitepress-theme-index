import type {
  I18NConfig,
  NameMatcher,
  LocaleModule,
  MaybePromise,
  LocaleMessages,
  BaseI18NConfig,
  BroadMatchI18nConfig,
  MixinMatchI18NConfig,
} from "@vitepress-theme-index/shared";
import { i18nLogger, escapeRegex } from "@vitepress-theme-index/shared";
import type { SiteData } from "vitepress";
import { merge } from "lodash-unified";
import type { LocaleRouteItem, ResolvedLocaleRoutes, ResolvedLocales } from "../../types";

/* ==================== utils ==================== */
const PLACEHOLDERS = ["name", "locale", "key"] as const;
const REPLACE_PATTERN = new RegExp(`\\[(${PLACEHOLDERS.join("|")})\\]`, "g");

function buildNameMatcher(name: BroadMatchI18nConfig["name"]): NameMatcher {
  if (typeof name === "function") return name as NameMatcher;
  const hasPlaceholder = REPLACE_PATTERN.test(name);
  REPLACE_PATTERN.lastIndex = 0;

  /* allow empty localeIndex input */
  return (localeIndex, candidate) => {
    const replaced = hasPlaceholder ? name.replace(REPLACE_PATTERN, localeIndex) : name;

    const escaped = escapeRegex(replaced);
    const regex = new RegExp(`(?:^|/)${escaped}$`);
    return regex.test(candidate);
  };
}

/* ==================== resolvers ==================== */
type LocaleContext<T extends BaseI18NConfig> = {
  localeIndex: string;
} & T;

interface LocaleResolver<MODE extends BaseI18NConfig> {
  match(mode: MODE["mode"]): MaybePromise<boolean>;
  resolve(ctx: LocaleContext<MODE>): MaybePromise<LocaleMessages | null>;
}

function createBroadResolver(): LocaleResolver<BroadMatchI18nConfig> {
  let localeJson: LocaleModule;

  return {
    match: (mode) => mode === "broad",
    async resolve(ctx) {
      if (!localeJson) localeJson = (await import("virtual:index-locale")).default;

      const matcher = buildNameMatcher(ctx.name);
      const paths = Object.keys(localeJson);

      const effectiveLocaleIndex = ctx.localeIndex === "root" ? "" : ctx.localeIndex;
      const matchPath = paths.find((p) => matcher(effectiveLocaleIndex, p));
      if (!matchPath) {
        i18nLogger.warn(`Missing module locale for "${ctx.localeIndex}"`);
        return null;
      }
      return localeJson[matchPath];
    },
  };
}

function createMixinResolver(): LocaleResolver<MixinMatchI18NConfig> {
  return {
    match: (mode) => mode === "mixin",
    resolve(ctx) {
      const item = ctx?.locale?.[ctx.localeIndex];

      if (!item || !item?.locale) {
        i18nLogger.warn(`Missing mixin locale config for "${ctx.localeIndex}"`);
        return null;
      }
      return item.locale;
    },
  };
}

class ResolverRegistry {
  private resolvers: LocaleResolver<BaseI18NConfig>[] = [];

  register(resolver: LocaleResolver<BaseI18NConfig>) {
    this.resolvers.push(resolver);
  }
  async resolve<T extends { mode?: string }>(
    ctx: LocaleContext<T>
  ): Promise<LocaleMessages | null> {
    for (const resolver of this.resolvers) {
      const matched = await resolver.match(ctx.mode);
      if (matched) return resolver.resolve(ctx);
    }
    return null;
  }
}

const registry = new ResolverRegistry();
registry.register(createBroadResolver());
registry.register(createMixinResolver());

/* ==================== resolve ==================== */
async function resolveIndexLocales(
  siteData: SiteData,
  config: I18NConfig,
  defaultMessage: LocaleMessages = {}
): Promise<ResolvedLocales & ResolvedLocaleRoutes> {
  const vpLocales = siteData.locales ?? {};
  const hasLocales = Object.keys(vpLocales).length > 0;

  const messages: LocaleModule = {};
  const routes: Record<string, LocaleRouteItem> = {};

  const localeKeys = hasLocales ? Object.keys(vpLocales) : ["root"];
  for (const localeIndex of localeKeys) {
    // build a message
    const ctx = { localeIndex, ...config };
    const localeMessages = await registry.resolve(ctx);
    messages[localeIndex] = merge({}, defaultMessage, localeMessages || {});
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
