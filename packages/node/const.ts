import type { IndexImportPluginConfig, ResolvedIndexPluginConfig } from "./types";

const DEFAULT_NAME = "vti";
const PLUGIN_PREFIX = "vitepress-theme-index";
const CONFIG_PATTERN = "index.config";
const NODE_EXTENSIONS = [".js", ".mjs", ".cjs"] as const;
const VITE_EXTENSIONS = [".ts", ".mts", ".js", ".mjs", ".cjs"] as const;

const DEFAULT_IMPORT_CONFIG: Required<IndexImportPluginConfig> = {
  file: null,
  mode: "unify",
  dir: ".vitepress",
};

const DEFAULT_PLUGIN_CONFIG: ResolvedIndexPluginConfig = {
  // could use unplugin-yaml to import.meta.glob yaml file
  i18n: { mode: "broad", file: `${DEFAULT_NAME}.json` },
  addition: { name: DEFAULT_NAME },
};

export {
  DEFAULT_NAME,
  PLUGIN_PREFIX,
  CONFIG_PATTERN,
  VITE_EXTENSIONS,
  NODE_EXTENSIONS,
  DEFAULT_IMPORT_CONFIG,
  DEFAULT_PLUGIN_CONFIG,
};
