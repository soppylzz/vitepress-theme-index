import type { EnhanceAppContext } from "vitepress";
import type { IndexClientConfig } from "../../types";
import { indexGlobalKey, indexOverallKey, indexArchiveKey } from "../../types";
import { installI18n, setupI18n } from "../i18n";
import { installRightMenu } from "../right-menu";
import { installIcons } from "../icon";
import { installTheme, setupTheme } from "./theme";
import { installAdditions } from "../views";
import { installGsap } from "./gsap";
import { isBrowser } from "@vitepress-theme-index/shared";
import { merge, pick } from "lodash-unified";

const defaultGlobalConfig: Required<Pick<IndexClientConfig, "comment">> = {
  comment: {
    type: "giscus",
    localeMap: {
      root: "zh-CN",
      en: "en",
    },
    fonts: {
      default: [
        {
          target: "code",
          src: "",
          type: "truetype",
        },
      ],
      "pixel-art": [
        {
          target: "text",
          src: "",
          type: "truetype",
        },
      ],
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
};

async function installPostData({ app }: EnhanceAppContext) {
  const stats = (await import("virtual:index-archive")).default;
  const all = (await import("virtual:index-overall")).default;
  app.provide(indexArchiveKey, stats);
  app.provide(indexOverallKey, all);
}

/* =============== main =============== */
async function installIndex(ctx: EnhanceAppContext, config: IndexClientConfig) {
  installGsap();
  installIcons(ctx);
  await installI18n(ctx);

  installRightMenu(ctx, config?.rightMenu);
  installTheme(ctx, config?.theme);
  await installAdditions(ctx, config);
  await installPostData(ctx);

  const resolvedGlobal = merge(defaultGlobalConfig, pick(config, "comment"));
  ctx.app.provide(indexGlobalKey, resolvedGlobal);
}

export function setupIndex() {
  if (isBrowser()) {
    setupI18n();
    setupTheme();
  }
}

export { installIndex };
