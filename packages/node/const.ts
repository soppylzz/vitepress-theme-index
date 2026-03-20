import type { ResolvedIndexConfig } from "@vitepress-theme-index/shared";
import type { BaseWatchConfig, ResolvedIndexPluginConfig } from "./types";

const PLUGIN_PREFIX = "vitepress-theme-index";
const CONFIG_PATTERN = "index.config";
const VITE_EXTENSIONS = [".ts", ".mts", ".js", ".mjs", ".cjs"] as const;
const NODE_EXTENSIONS = [".js", ".mjs", ".cjs"] as const;

const DEFAULT_INIT_CONFIG: ResolvedIndexConfig = {
  i18n: {
    mode: "broad",
    name: "[name]/vti.json",
  },
};
const DEFAULT_CONFIG: ResolvedIndexConfig = {
  ...DEFAULT_INIT_CONFIG,
};

const watchDefault: BaseWatchConfig["watch"] = {
  enabled: true,
  debounce: 100,
};
const DEFAULT_PLUGIN_CONFIG: ResolvedIndexPluginConfig = {
  mode: "unify",
  config: {
    watch: watchDefault,
    file: null,
  },
  locales: {
    watch: watchDefault,
    patterns: ["!**/node_modules/**", "/**/vti.json"],
  },
};

export {
  PLUGIN_PREFIX,
  CONFIG_PATTERN,
  VITE_EXTENSIONS,
  NODE_EXTENSIONS,
  DEFAULT_CONFIG,
  DEFAULT_PLUGIN_CONFIG,
};
