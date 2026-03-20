import { createI18n, useI18n } from "vue-i18n";
import type { EnhanceAppContext } from "vitepress";
import { useData } from "vitepress";
import type { I18NConfig } from "@vitepress-theme-index/shared";
import { watch } from "vue";
import { resolveIndexLocales } from "./resolve";
import defaultLocales from "./default";
import { indexI18nKey } from "../../types";

export async function installIndexI18n(ctx: EnhanceAppContext, config: I18NConfig) {
  const { initialLocale, messages, routes } = await resolveIndexLocales(
    ctx.siteData.value,
    config,
    defaultLocales
  );

  const i18n = createI18n({
    legacy: false,
    locale: initialLocale,
    fallbackLocale: initialLocale,
    globalInjection: true,
    messages,
  });

  ctx.app.use(i18n);
  ctx.app.provide(indexI18nKey, {
    routes: routes,
  });
}

export function setupIndexI18n() {
  // Must be called at the top of a `setup` function
  const { locale } = useI18n();
  const { localeIndex } = useData();

  watch(
    () => localeIndex.value,
    (val) => {
      locale.value = val;
    },
    { immediate: true }
  );
}

export * from "./resolve";
