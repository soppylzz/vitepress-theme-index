import { reactive } from "vue";
import { clearObject } from "@vitepress-theme-index/shared";
import type { WithContext } from "../../types";

function createMenuContext<Config extends object>(config: Config): WithContext<Config> {
  const ctx = reactive(config);
  const reset = () => {
    clearObject(ctx);
    Object.assign(ctx, config);
  };
  return { ...config, ctx, reset };
}

export { createMenuContext };
