import type { IndexPluginContext } from "../types";
import { PLUGIN_PREFIX } from "../const";
import { type Plugin } from "vite";
import { createIndexConfigLoader, normalizeAlias } from "../utils";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PKG_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..", "..");
const CLIENT_MOD = resolve(PKG_ROOT, "client");
const NODE_MOD = resolve(PKG_ROOT, "node");

export function useImportPlugin(ctx: IndexPluginContext): Plugin {
  const { mode = "unify", alias, setAlias } = ctx;

  switch (mode) {
    case "unify":
      setAlias("client", [{ find: /^vitepress-theme-index$/, replacement: CLIENT_MOD }]);
      setAlias("node", [{ find: /^vitepress-theme-index$/, replacement: NODE_MOD }]);
      break;
    case "normal":
    default:
      setAlias("client", [
        { find: /^vitepress-theme-index$/, replacement: "vitepress-theme-index/client" },
      ]);
  }

  return {
    name: `${PLUGIN_PREFIX}/import`,
    config(config) {
      config.resolve ||= {};
      const userAlias = normalizeAlias(config.resolve?.alias);
      // resolve "vitepress-theme-index" as "vitepress-theme-index/client" default
      config.resolve.alias = [...userAlias, ...(alias?.client ?? [])];
    },
    async buildStart(_options) {
      ctx.loader = createIndexConfigLoader(ctx);
    },
  };
}
