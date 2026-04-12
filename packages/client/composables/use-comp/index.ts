import { computed, getCurrentInstance, useAttrs } from "vue";
import type { MaybeArray } from "@vitepress-theme-index/shared";
import { ensureArray, hasOwnProperty } from "@vitepress-theme-index/shared";
import { pascalCase } from "../../utils";

function hasEmitHook(event: string) {
  const ins = getCurrentInstance();
  const onName = `on${pascalCase(event)}`;
  return !!ins?.vnode.props?.[onName];
}

export { hasEmitHook };
