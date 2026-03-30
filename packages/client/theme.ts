import type { Theme } from "vitepress";
import Layout from "./Layout.vue";
import { installIndex, setupIndex } from "./plugins";
import type { IndexClientConfig, IndexClientAdditionConfig } from "./types";
import type { DefineAble } from "@vitepress-theme-index/shared";

/* ==================== public ==================== */
type WithIndexConfig = Theme & { index?: IndexClientConfig };
function withIndex(theme: WithIndexConfig = {}): Theme {
  const { index = {}, ...mixins } = theme;
  return {
    Layout: mixins?.Layout ?? Layout,
    async enhanceApp(ctx) {
      await installIndex(ctx, index);
      await mixins?.enhanceApp?.(ctx);
    },
    setup() {
      setupIndex();
      mixins?.setup?.();
    },
  };
}

function withAdditionIndex(config: DefineAble<IndexClientAdditionConfig>): typeof config {
  return config;
}

export { withIndex, withAdditionIndex };
