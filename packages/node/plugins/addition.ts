import type { Plugin } from "vite";
import { INDEX_ADDITION_NAME, INDEX_ADDITION_PKG } from "@vitepress-theme-index/shared";
import { PLUGIN_PREFIX, VITE_EXTENSIONS } from "../const";
import type { IndexPluginContext } from "../types";

function createAdditionPlugin(ctx: IndexPluginContext): Plugin {
  return {
    name: `${PLUGIN_PREFIX}/addition`,
    resolveId(id) {
      return id === INDEX_ADDITION_PKG ? id : undefined;
    },
    load(id) {
      if (id !== INDEX_ADDITION_PKG) return;
      const { addition } = ctx?.ctx ?? {};
      const name = addition?.name || INDEX_ADDITION_NAME;
      const patterns = [
        "!**/node_modules/**",
        ...VITE_EXTENSIONS.map((ext) => `/**/${name}${ext}`),
      ];
      return `
            export const configs = import.meta.glob(${JSON.stringify(patterns)}, 
                                        { eager: true, import: "default"})`;
    },
    handleHotUpdate({ file, server }) {
      const { addition } = ctx?.ctx ?? {};
      if (
        addition?.name &&
        VITE_EXTENSIONS.some((ext) => file.endsWith(`${addition.name}${ext}`))
      ) {
        const mod = server.moduleGraph.getModuleById(INDEX_ADDITION_PKG);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload", path: "*" });
      }
    },
  };
}

export { createAdditionPlugin };
