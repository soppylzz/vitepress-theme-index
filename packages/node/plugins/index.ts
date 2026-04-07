import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import type { IndexPluginInitConfig, IndexPluginContext } from "../types";
import { createConfigPlugin } from "./config";
import type { DeepPartial } from "@vitepress-theme-index/shared";
import { setupIndexErrorInterceptor } from "@vitepress-theme-index/shared";
import { PLUGIN_PREFIX } from "../const";
import { createI18nPlugin } from "./i18n";
import { createAdditionPlugin } from "./addition";
import { createMetaPlugin } from "./post";

const ctx: IndexPluginContext = { cwd: process.cwd() };
function createPluginContext(): Plugin {
  return {
    name: `${PLUGIN_PREFIX}/base`,
    enforce: "pre",
    configResolved(config: ResolvedConfig) {
      ctx.viteConfig = config;
    },
    configureServer(server: ViteDevServer) {
      ctx.viteServer = server;
    },
  };
}

function vitepressThemeIndex(config?: DeepPartial<IndexPluginInitConfig>): Plugin[] {
  const contextPlugin = createPluginContext();
  const configPlugin = createConfigPlugin(ctx, config);
  const additionPlugin = createAdditionPlugin(ctx);
  const i18nPlugin = createI18nPlugin(ctx);
  const metaPlugin = createMetaPlugin(ctx);
  return [
    /**
     * ⚠️ Notes:
     * - This module does not support reactive updates at runtime.
     * - Make sure to properly manage the lifecycle of `ctx` within Vite.
     * - The order of plugin injection is crucial.
     */
    contextPlugin,
    configPlugin,
    additionPlugin,
    i18nPlugin,
    metaPlugin,
  ];
}

export { vitepressThemeIndex };
