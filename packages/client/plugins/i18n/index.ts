import { createI18n, useI18n } from "vue-i18n";
import type { EnhanceAppContext } from "vitepress";
import { useData } from "vitepress";
import { watch } from "vue";
import { mapLocaleKey, resolveIndexLocales } from "./resolve";
import { defaultMessage, defaultDateFormat } from "./default";
import { indexI18nKey } from "../../types";

async function installI18n(ctx: EnhanceAppContext) {
  const { initialLocale, messages, routes, datetimeFormats } = await resolveIndexLocales(
    ctx.siteData.value,
    defaultMessage,
    defaultDateFormat
  );
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: initialLocale,
    fallbackLocale: initialLocale,
    datetimeFormats: datetimeFormats as any,
    messages,
  });
  ctx.app.use(i18n);
  ctx.app.provide(indexI18nKey, { routes: routes });
}

export function setupI18n() {
  // Must be called at the top of a `setup` function
  const { locale } = useI18n();
  const { localeIndex } = useData();

  watch(
    () => localeIndex.value,
    (key) => {
      locale.value = mapLocaleKey(key);
    },
    { immediate: true }
  );
}

export { installI18n };
