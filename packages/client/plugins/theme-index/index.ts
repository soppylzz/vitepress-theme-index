import type { EnhanceAppContext } from "vitepress";
import type { IndexClientConfig } from "../../types";
import { installMisc } from "./misc";
import { installAdditions } from "./views";
import { installRightMenu } from "../right-menu";
import { installTheme, setupTheme } from "./theme";
import { installI18n, setupI18n } from "../i18n";
import { isBrowser } from "@vitepress-theme-index/shared";

/* =============== main =============== */
async function installIndex(ctx: EnhanceAppContext, config: IndexClientConfig) {
  await installI18n(ctx);
  await installAdditions(ctx, config);

  installMisc(ctx, config);
  installTheme(ctx, config?.theme);
  installRightMenu(ctx, config?.rightMenu);
}

export function setupIndex() {
  if (isBrowser()) {
    setupI18n();
    setupTheme();
  }
}

export { installIndex };
