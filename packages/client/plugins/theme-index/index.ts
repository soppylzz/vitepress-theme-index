import type { EnhanceAppContext } from "vitepress";
import indexConfig from "virtual:index-config";
import type { IndexClientConfig, MenuItemRecord } from "../../types";
import { installIndexI18n, setupIndexI18n } from "../i18n";
import { installIndexRightMenu } from "../right-menu";
import { installIndexIcons } from "../icon";
import { installIndexTheme } from "./theme";

/* =============== main =============== */
async function installIndex(ctx: EnhanceAppContext, config: IndexClientConfig<MenuItemRecord>) {
  await installIndexI18n(ctx, indexConfig?.i18n);
  installIndexRightMenu(ctx, config?.rightMenu);
  installIndexTheme(ctx, config?.theme);
  installIndexIcons(ctx);
}

export function setupIndex() {
  setupIndexI18n();
}

export { installIndex };
