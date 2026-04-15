import type { EnhanceAppContext } from "vitepress";
import type { IndexClientConfig } from "../../types";
import { indexOverallKey, indexArchiveKey } from "../../types";
import { installI18n, setupI18n } from "../i18n";
import { installRightMenu } from "../right-menu";
import { installIcons } from "../icon";
import { installTheme } from "./theme";
import { installAdditions } from "../views";
import { installGsap } from "./gsap";

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
}

export function setupIndex() {
  setupI18n();
}

export { installIndex };
