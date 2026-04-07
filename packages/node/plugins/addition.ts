import type { Plugin } from "vite";
import { VIRTUAL_INDEX_ADDITION_PKG } from "@vitepress-theme-index/shared";
import { PLUGIN_PREFIX, DEFAULT_NAME, VITE_EXTENSIONS } from "../const";
import type { IndexPluginContext } from "../types";

const addVirtualId = VIRTUAL_INDEX_ADDITION_PKG;
const addResolvedId = `\0${addVirtualId}`;

function createAdditionPlugin(ctx: IndexPluginContext): Plugin {
  return {
    name: `${PLUGIN_PREFIX}/addition`,
    resolveId(id) {
      return id === addVirtualId ? addResolvedId : undefined;
    },
    load(id) {
      if (id !== addResolvedId) return;
      const { addition } = ctx?.ctx ?? {};
      const name = addition?.name || DEFAULT_NAME;
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
        const mod = server.moduleGraph.getModuleById(addResolvedId);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload", path: "*" });
      }
    },
  };
}

export { createAdditionPlugin, addResolvedId };
