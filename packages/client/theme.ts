import { h } from "vue";
import type { Theme } from "vitepress";
import Layout from "./Layout.vue";
import { installIndex, setupIndex } from "./plugins";
import type { IndexClientConfig, IndexClientAdditionConfig } from "./types";
import type { DefineAble } from "@vitepress-theme-index/shared";

/* ==================== public ==================== */
type WithIndexConfig = Theme & { config?: IndexClientConfig };
function withIndex(theme: WithIndexConfig = {}): Theme {
  return {
    Layout: () => h(Layout),
    ...theme,
    async enhanceApp(ctx) {
      await installIndex(ctx, theme?.config);
      await theme?.enhanceApp?.(ctx);
    },
    setup() {
      setupIndex();
      theme?.setup?.();
    },
  };
}

function withAdditionIndex(config: DefineAble<IndexClientAdditionConfig>): typeof config {
  return config;
}

export { withIndex, withAdditionIndex };
