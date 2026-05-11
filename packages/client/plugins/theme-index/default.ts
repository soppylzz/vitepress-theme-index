import type { IndexClientConfig, IndexGlobalConfig, ResolvedIndexThemeConfig } from "../../types";

const defaultGlobalConfig = {
  comment: {
    type: "giscus",
    localeMap: {
      root: "zh-CN",
      en: "en",
    },
    fontMap: {
      default: {
        code: "lxgw",
        text: "lxgw",
        fonts: [
          {
            name: "lxgw",
            src: "https://soppy-dev-1351762962.cos.ap-chongqing.myqcloud.com/LXGWWenKaiScreen.ttf",
            type: "truetype",
          },
        ],
      },
    },
    repo: "soppylzz/vitepress-theme-index",
    repoId: "R_kgDOQuHolQ",
    mapping: "pathname",
    category: "Announcements",
    categoryId: "DIC_kwDOQuHolc4C7YKJ",
    strict: "1",
    emitMetadata: "1",
    reactionsEnabled: "1",
    inputPosition: "top",
  },
  search: {
    mode: "mini-search",
    timeout: 5000,
    delay: 500,
    config: {
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
      },
    },
  },
} satisfies Required<Pick<IndexClientConfig, keyof IndexGlobalConfig>>;

const defaultThemeConfig = {
  breakPoint: [768, 1280],
  fontSize: 16,
  preset: "default",
  mode: "auto",
} satisfies ResolvedIndexThemeConfig;

export { defaultThemeConfig, defaultGlobalConfig };
