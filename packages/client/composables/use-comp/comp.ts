import { computed, getCurrentInstance, useId } from "vue";
import type { MaybeArray } from "@vitepress-theme-index/shared";
import { ensureArray, pascalCase } from "@vitepress-theme-index/shared";
import { isNull, isUndefined } from "lodash-unified";

function hasEmitHook(event: string) {
  const ins = getCurrentInstance();
  const onName = `on${pascalCase(event)}`;
  return !!ins?.vnode.props?.[onName];
}

function useHasProps<T extends object>(props: T, keys: MaybeArray<keyof T>) {
  const keyArr = ensureArray(keys);
  return computed(() =>
    keyArr.some((key) => {
      const val = props[key];
      return !isUndefined(val) && !isNull(val) && val !== "";
    })
  );
}

function useDecorator() {
  const uid = useId();
  function withId(str: string) {
    return `${str}-${uid}`;
  }
  return { withId };
}

export { hasEmitHook, useDecorator, useHasProps };
