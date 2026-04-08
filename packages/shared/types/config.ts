/* ==================== unit ==================== */
import type { IntlDateTimeFormats } from "vue-i18n";

type LocaleMessages = Record<string, any>;
type LocaleModule = Record<string, LocaleMessages>; // virtual locale
type LocaleMixin = { locale: LocaleMessages };
type LocaleConfig = Record<string, LocaleMixin>; // vp mixin locale

/* ==================== module ==================== */
type BroadMatchI18nConfig = { mode: "broad"; file: string };
type MixinMatchI18NConfig = { mode: "mixin"; locale: LocaleConfig };

type I18nDatetimeFormatKey = "long" | "short" | "date" | "time";

type I18nDatetimeFormatSchema = Record<I18nDatetimeFormatKey, Partial<Intl.DateTimeFormatOptions>>;

type I18NConfig = (MixinMatchI18NConfig | BroadMatchI18nConfig) & {
  rootLocale: string;
  datetimeFormats: Partial<IntlDateTimeFormats<I18nDatetimeFormatSchema>>;
};

export type {
  LocaleConfig,
  LocaleModule,
  LocaleMessages,
  // i18n modules
  I18NConfig,
  I18nDatetimeFormatKey,
  I18nDatetimeFormatSchema,
  MixinMatchI18NConfig,
  BroadMatchI18nConfig,
};
