import { h } from "vue";
import type { Theme } from "vitepress";
import Layout from "./Layout.vue";
import { installIndex, setupIndex } from "./plugins";
import type { IndexClientConfig, MenuItemRecord } from "./types";

/* ==================== public ==================== */
function withIndex(theme: Theme & { config?: IndexClientConfig<MenuItemRecord> } = {}): Theme {
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

export { withIndex };
