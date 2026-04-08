import type { Plugin } from "vite";
import type { IndexPluginContext } from "../types";
import { VIRTUAL_INDEX_I18N_PKG } from "@vitepress-theme-index/shared";
import { PLUGIN_PREFIX } from "../const";
import { pick } from "lodash-unified";

const i18nVirtualId = VIRTUAL_INDEX_I18N_PKG;
const i18nResolvedId = `\0${i18nVirtualId}`;

function createI18nPlugin(ctx: IndexPluginContext): Plugin {
  return {
    name: `${PLUGIN_PREFIX}/i18n`,
    resolveId(id) {
      return id === i18nVirtualId ? i18nResolvedId : undefined;
    },
    load(id) {
      if (id !== i18nResolvedId) return;
      const { i18n } = ctx?.ctx ?? {};

      const baseExportCode = `export const config = ${JSON.stringify(pick(i18n, ["mode", "rootLocale", "datetimeFormat"]) ?? {})};`;
      switch (i18n.mode) {
        case "mixin": {
          return `${baseExportCode} export const data = ${JSON.stringify(i18n.locale ?? {})};`;
        }
        case "broad":
        default: {
          const patterns = ["!**/node_modules/**", `/**/${i18n.file}`];
          return `${baseExportCode} export const data = import.meta.glob(${JSON.stringify(patterns)}, { eager: true, import: "default"})`;
        }
      }
    },
    handleHotUpdate({ file, server }) {
      const { i18n } = ctx?.ctx ?? {};

      if (i18n?.mode !== "mixin" && file.endsWith(`${i18n.file}.json`)) {
        const mod = server.moduleGraph.getModuleById(i18nResolvedId);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload", path: "*" });
      }
    },
  };
}

export { createI18nPlugin, i18nResolvedId };
