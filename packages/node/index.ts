import type { DefineAble } from "@vitepress-theme-index/shared";
import type { UserIndexPluginConfig } from "./types";

function defineIndex(config: DefineAble<UserIndexPluginConfig> = {}): typeof config {
  return config;
}

export { withIndexMarkdown } from "./markdown";
export { vitepressThemeIndex } from "./plugins";
export { defineIndex };
