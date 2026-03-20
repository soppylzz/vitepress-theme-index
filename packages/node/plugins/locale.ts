import type { IndexPluginContext } from "../types";
import { resolveWatchConfig } from "../utils";
import { PLUGIN_PREFIX } from "../const";
import { type Plugin } from "vite";
import { ensureArray, VIRTUAL_INDEX_LOCALE_PKG } from "@vitepress-theme-index/shared";

export function useLocalePlugin(ctx: IndexPluginContext): Plugin {
  const virtualId = VIRTUAL_INDEX_LOCALE_PKG;
  const resolvedId = `\0${VIRTUAL_INDEX_LOCALE_PKG}`;

  let _watcherRegistered = false;
  let debounceTimer: NodeJS.Timeout | null = null;
  const _localePatterns: string[] = ensureArray(ctx.locales.patterns ?? []);

  const loadLocales = () => {
    return _localePatterns.length === 0
      ? `export default {};`
      : `const modules = import.meta.glob(${JSON.stringify(_localePatterns)},
                                                    {eager: true, import: "default"});
               export default modules;`;
  };

  return {
    name: `${PLUGIN_PREFIX}/locale`,
    async buildStart(_options) {
      const { viteServer, locales } = ctx;
      const { watchEnabled, debounceTime } = resolveWatchConfig(locales.watch);

      if (watchEnabled && viteServer && !_watcherRegistered) {
        _watcherRegistered = true;

        viteServer.watcher.add(_localePatterns).on("change", () => {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            const mod = viteServer.moduleGraph.getModuleById(resolvedId);
            if (mod) {
              viteServer.moduleGraph.invalidateModule(mod);
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
      return id === resolvedId ? loadLocales() : undefined;
    },
  };
}
