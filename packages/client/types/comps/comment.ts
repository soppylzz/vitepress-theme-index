import type { MaybeArray } from "@vitepress-theme-index/shared";
import type { AvailableLanguage, GiscusProps } from "@giscus/vue";

interface GiscusInjectionFont {
  name: string;
  src: string;
  type: string;
}

interface GiscusFontConfig {
  fonts: GiscusInjectionFont[];
  code: MaybeArray<string>;
  text: MaybeArray<string>;
}

interface GiscusConfig extends GiscusProps {
  type: "giscus";
  fontMap: Record<string, GiscusFontConfig>;
  localeMap: Record<string, AvailableLanguage>;
}

type IndexCommentConfig = GiscusConfig;

export type { IndexCommentConfig, GiscusFontConfig, GiscusInjectionFont, GiscusConfig };
