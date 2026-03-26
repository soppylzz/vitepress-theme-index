import type { EnhanceAppContext } from "vitepress";
import indexConfig from "virtual:index-config";
import type { IndexClientConfig } from "../../types";
import { installI18n, setupI18n } from "../i18n";
import { installRightMenu } from "../right-menu";
import { installIcons } from "../icon";
import { installTheme } from "./theme";
import { installViews } from "../views";

/* =============== main =============== */
async function installIndex(ctx: EnhanceAppContext, config: IndexClientConfig) {
  installIcons(ctx);
  installTheme(ctx, config?.theme);
  await installI18n(ctx, indexConfig?.i18n);
  installRightMenu(ctx, config?.rightMenu);
  installViews(ctx, config);
}

export function setupIndex() {
  setupI18n();
}

export { installIndex };
