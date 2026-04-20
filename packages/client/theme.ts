import type { Theme } from "vitepress";
import IndexLayout from "./layout.vue";
import { installIndex, setupIndex } from "./plugins";
import type { IndexClientConfig, IndexClientAdditionConfig } from "./types";
import type { DefineAble } from "@vitepress-theme-index/shared";

/* ==================== public ==================== */
type WithIndexConfig = Theme & { index?: IndexClientConfig };
function withIndex(theme: WithIndexConfig = {}): Theme {
  const { Layout = IndexLayout, enhanceApp, setup, index = {} } = theme;

  return {
    Layout: Layout,
    async enhanceApp(ctx) {
      await installIndex(ctx, index);
      await enhanceApp?.(ctx);
    },
    setup() {
      setupIndex();
      setup?.();
    },
  };
}

function withAdditionIndex(config: DefineAble<IndexClientAdditionConfig>): typeof config {
  return config;
}

export { withIndex, withAdditionIndex };
