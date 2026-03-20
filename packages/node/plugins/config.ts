import { PLUGIN_PREFIX } from "../const";
import type { IndexPluginContext } from "../types";
import type { LoadFn } from "../utils";
import { resolveWatchConfig } from "../utils";
import { type Plugin } from "vite";
import type { ResolvedIndexConfig } from "@vitepress-theme-index/shared";
import { pluginLogger, VIRTUAL_INDEX_CONFIG_PKG } from "@vitepress-theme-index/shared";

export function useConfigPlugin(ctx: IndexPluginContext<LoadFn>): Plugin {
  let resolvedConfig: ResolvedIndexConfig;

  let _watcherRegistered = false;
  let debounceTimer: NodeJS.Timeout | null = null;

  const virtualId = VIRTUAL_INDEX_CONFIG_PKG;
  const resolvedId = `\0${VIRTUAL_INDEX_CONFIG_PKG}`;

  const loadConfig = async () => {
    if (!ctx.loader) pluginLogger.error("Loader not found in plugin context");
    try {
      resolvedConfig = await ctx.loader!.load({ alias: ctx.alias?.node ?? [] });
    } catch (e) {
      pluginLogger.error(`Failed to load config: ${e}`);
    }
  };

  return {
    name: `${PLUGIN_PREFIX}/config`,
    async buildStart() {
      await loadConfig();

      const { config, viteServer } = ctx;

      // resolve config
      const filePath = ctx.loader!.filePath;
      const { watchEnabled, debounceTime } = resolveWatchConfig(config.watch);

      if (watchEnabled && viteServer && filePath && !_watcherRegistered) {
        _watcherRegistered = true;
        // watch config file
        viteServer.watcher.add(filePath).on("change", (changed) => {
          if (changed !== filePath) return;

          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(async () => {
            pluginLogger.info(`Config file changed: ${filePath}`);

            ctx.loader!.reset();
            await loadConfig();

            const mod = viteServer.moduleGraph.getModuleById(resolvedId);
            if (mod) {
              viteServer.moduleGraph.invalidateModule(mod);
              try {
                // Reload the virtual module
                await viteServer.ssrLoadModule(resolvedId);
                pluginLogger.info(`Config module reloaded`);
              } catch (e) {
                pluginLogger.error(`Failed to reload module: ${e}`);
              }
            }

            viteServer.ws.send({ type: "full-reload", path: "*" });
          }, debounceTime);
        });
      }
    },
    resolveId(id) {
      return id === virtualId ? resolvedId : undefined;
    },
    load(id) {
      return id === resolvedId ? `export default ${JSON.stringify(resolvedConfig)}` : undefined;
    },
  };
}
