import type { EnhanceAppContext } from "vitepress";
import type { IndexClientConfig } from "../../types";
import { installI18n, setupI18n } from "../i18n";
import { installRightMenu } from "../right-menu";
import { installIcons } from "../icon";
import { installTheme } from "./theme";
import { installViews } from "../views";

/* =============== main =============== */
async function installIndex(ctx: EnhanceAppContext, config: IndexClientConfig) {
  installIcons(ctx);
  await installI18n(ctx);

  installRightMenu(ctx, config?.rightMenu);
  installTheme(ctx, config?.theme);
  await installViews(ctx, config);
}

export function setupIndex() {
  setupI18n();
}

export { installIndex };
