import type {
  ImportAlias,
  IndexPluginContext,
  ResolvedIndexPluginConfig,
  UserIndexPluginConfig,
} from "../types";
import { importAliasKeys } from "../types";
import { merge } from "lodash-unified";
import { DEFAULT_PLUGIN_CONFIG, PLUGIN_PREFIX } from "../const";
import type { Alias, ResolvedConfig, ViteDevServer, Plugin } from "vite";
import { pluginLogger } from "@vitepress-theme-index/shared";

export function createIndexPluginContext(userConfig: UserIndexPluginConfig) {
  const pluginConfig = merge(userConfig, DEFAULT_PLUGIN_CONFIG) as ResolvedIndexPluginConfig;

  const _alias: ImportAlias = {};
  const setAlias = (key: keyof ImportAlias, value: Alias[] = []) => {
    if (importAliasKeys.includes(key)) {
      if (Object.keys(_alias).includes(key)) pluginLogger.warn(`Import ${key} already exists`);
      _alias[key] = value;
    }
  };

  /**
   * Note ⚠️:
   * - No reactive updates during runtime.
   * - Ensure proper handling of the `ctx` property lifecycle in vite.
   */
  const ctx: IndexPluginContext = {
    ...pluginConfig,
    get alias() {
      return _alias;
    },
    setAlias,
  };

  const contextPlugin: Plugin = {
    name: `${PLUGIN_PREFIX}/base`,
    configResolved(config: ResolvedConfig) {
      ctx.viteConfig = config;
    },
    configureServer(server: ViteDevServer) {
      ctx.viteServer = server;
    },
  };

  return { ctx, contextPlugin };
}
