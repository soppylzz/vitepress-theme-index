import type { DeepPartial, DeepRequired } from "./utils";

/* ==================== unit ==================== */
type LocaleMessages = Record<string, any>;
type LocaleModule = Record<string, LocaleMessages>; // virtual locale
type LocaleMixin = { locale: LocaleMessages };
type LocaleConfig = Record<string, LocaleMixin>; // vp mixin locale

type NameMatcher = (localeIndex: string, candidate: string) => boolean;

/* ==================== module ==================== */
interface BaseI18NConfig {
  mode?: string;
}
interface MixinMatchI18NConfig extends BaseI18NConfig {
  mode: "mixin";
  locale: LocaleConfig;
}
interface BroadMatchI18nConfig extends BaseI18NConfig {
  mode: "broad";
  name: string | NameMatcher;
}
type I18NConfig = MixinMatchI18NConfig | BroadMatchI18nConfig;

/* ==================== configs ==================== */
type UserIndexConfig = DeepPartial<{
  i18n: I18NConfig;
}>;

type ResolvedIndexConfig = DeepRequired<UserIndexConfig>;

export type {
  LocaleMessages,
  LocaleModule,
  NameMatcher,
  BaseI18NConfig,
  MixinMatchI18NConfig,
  BroadMatchI18nConfig,
  I18NConfig,
  UserIndexConfig,
  ResolvedIndexConfig,
};
