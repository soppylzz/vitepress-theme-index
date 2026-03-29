/* ==================== unit ==================== */
type LocaleMessages = Record<string, any>;
type LocaleModule = Record<string, LocaleMessages>; // virtual locale
type LocaleMixin = { locale: LocaleMessages };
type LocaleConfig = Record<string, LocaleMixin>; // vp mixin locale

/* ==================== module ==================== */
type BroadMatchI18nConfig = { mode: "broad"; file: string };
type MixinMatchI18NConfig = { mode: "mixin"; locale: LocaleConfig };
type I18NConfig = MixinMatchI18NConfig | BroadMatchI18nConfig;

export type {
  LocaleConfig,
  LocaleModule,
  LocaleMessages,
  // i18n modules
  I18NConfig,
  MixinMatchI18NConfig,
  BroadMatchI18nConfig,
};
