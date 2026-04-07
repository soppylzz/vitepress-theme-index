import type { IndexImportPluginConfig, ResolvedIndexPluginConfig } from "./types";
import type { PostMetaInfo } from "@vitepress-theme-index/shared";

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
  meta: {
    cache: {
      enable: true,
      file: "./.vitepress/cache/vti/vti-meta.json",
      concurrency: 32,
      defaultLast: "now",
    },
    exclude: ["**/node_modules/**", ".vitepress/**"],
    include: ["**/*.md"],
  },
  plugins: [
    {
      name: "timeline",
      extract(post: PostMetaInfo) {
        const date = new Date(post.firstCommit);
        return isNaN(date.getTime()) ? "unknown" : date.getFullYear().toString();
      },
    },
  ],
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
