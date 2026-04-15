import type { IndexImportPluginConfig, ResolvedIndexPluginConfig } from "./types";
import type { PostRawData } from "@vitepress-theme-index/shared";
import { INDEX_ADDITION_NAME } from "@vitepress-theme-index/shared";

const PLUGIN_PREFIX = "vitepress-theme-index";
const NODE_EXTENSIONS = [".js", ".mjs", ".cjs"] as const;
const VITE_EXTENSIONS = [".ts", ".mts", ".js", ".mjs", ".cjs"] as const;

const DEFAULT_IMPORT_CONFIG: Required<IndexImportPluginConfig> = {
  file: null,
  mode: "unify",
  dir: ".vitepress",
};

const DEFAULT_PLUGIN_CONFIG: ResolvedIndexPluginConfig = {
  // could use unplugin-yaml to import.meta.glob yaml file
  i18n: {
    mode: "broad",
    rootLocale: "zh-cn",
    datetimeFormats: {},
    file: `${INDEX_ADDITION_NAME}.json`,
  },
  addition: { name: INDEX_ADDITION_NAME },
  meta: {
    cache: {
      enable: true,
      pageSize: 1,
      concurrency: 32,
      defaultLast: "now",
      dir: "vti",
    },
    exclude: ["**/node_modules/**", ".vitepress/**"],
    include: ["**/*.md"],
  },
  plugins: [
    {
      name: "en:archive",
      extract(post: PostRawData) {
        return /^en\//.test(post.path) ? "post" : undefined;
      },
    },
    {
      name: "zh:archive",
      extract(post: PostRawData) {
        return !/^(en)\//.test(post.path) ? "post" : undefined;
      },
    },
  ],
};

export {
  PLUGIN_PREFIX,
  VITE_EXTENSIONS,
  NODE_EXTENSIONS,
  DEFAULT_IMPORT_CONFIG,
  DEFAULT_PLUGIN_CONFIG,
};
