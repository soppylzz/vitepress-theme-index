import { computed, useAttrs } from "vue";
import type { MaybeArray } from "@vitepress-theme-index/shared";
import { ensureArray, hasOwnProperty } from "@vitepress-theme-index/shared";

function useAttrsExist(keys: MaybeArray<string>) {
  const attrs = useAttrs();
  const keyArr = ensureArray(keys);

  const existed = computed(() => !keyArr.some((key) => !hasOwnProperty(attrs, key)));
  return { existed };
}

export { useAttrsExist };
