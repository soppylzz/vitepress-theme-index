import type { Plugin } from "vite";
import type { IndexPluginContext } from "../types";
import { INDEX_I18N_PKG } from "@vitepress-theme-index/shared";
import { PLUGIN_PREFIX } from "../const";
import { pick } from "lodash-unified";

function createI18nPlugin(ctx: IndexPluginContext): Plugin {
  return {
    name: `${PLUGIN_PREFIX}/i18n`,
    resolveId(id) {
      return id === INDEX_I18N_PKG ? id : undefined;
    },
    load(id) {
      if (!ctx?.ctx) return;
      if (id !== INDEX_I18N_PKG) return;

      const { i18n } = ctx.ctx;
      const baseExportCode = `export const config = ${JSON.stringify(pick(i18n, ["mode", "rootLocale", "datetimeFormat"]) ?? {})};`;
      switch (i18n.mode) {
        case "mixin": {
          return `${baseExportCode} export const data = ${JSON.stringify(i18n.locale ?? {})};`;
        }
        case "broad":
        default: {
          // TODO: add prefix limit
          const patterns = ["!**/node_modules/**", `/**/${i18n.file}`];
          return `${baseExportCode} export const data = import.meta.glob(${JSON.stringify(patterns)}, { eager: true, import: "default"})`;
        }
      }
    },
    handleHotUpdate({ file, server }) {
      const { i18n } = ctx?.ctx ?? {};

      if (i18n && i18n?.mode !== "mixin" && file.endsWith(`${i18n.file}.json`)) {
        const mod = server.moduleGraph.getModuleById(INDEX_I18N_PKG);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload", path: "*" });
      }
    },
  };
}

export { createI18nPlugin };
