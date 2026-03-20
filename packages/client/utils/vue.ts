import type { UnwrapNestedRefs } from "vue";
import { computed, reactive, readonly, ref, watch } from "vue";
import { isObject, isUndefined } from "lodash-unified";
import { clearObject, hasOwnProperty } from "@vitepress-theme-index/shared";
import type { CachedComputedRef } from "../types";

interface UseReactiveProxyOptions<T extends object> {
  setters?: {
    [K in keyof T]?: (old: T[K] | undefined, val: T[K] | undefined, payload?: any) => T[K];
  };
  getters?: { [K in keyof T]?: (source?: T[K] | undefined, override?: T[K] | undefined) => T[K] };
}

function useReactiveProxy<
  T extends UnwrapNestedRefs<object>,
  Options extends UseReactiveProxyOptions<T>,
>(source: T, options?: Options) {
  const proxy = reactive<Partial<T>>({});
  const _state = reactive<T>({ ...source });

  const { setters = {} as any, getters = {} as any } = options || {};

  function setFn(key: any, val: any, payload?: any) {
    proxy[key] = hasOwnProperty(setters, key) ? setters[key](proxy[key], val, payload) : val;
  }

  function getFn(key: any) {
    _state[key] = hasOwnProperty(getters, key)
      ? getters[key](source[key], proxy[key])
      : isUndefined(proxy[key])
        ? proxy[key]
        : source[key];
  }

  watch(
    [proxy, source],
    () => {
      clearObject(_state);
      const keys = new Set(Object.keys({ ...proxy, ...source }));
      keys.forEach((key) => getFn(key));
    },
    { flush: "post", deep: true }
  );

  function reset() {
    clearObject(proxy);
  }

  function set(
    obj: Partial<T>,
    payloads?: { [K in keyof T]?: Parameters<Options["setters"][K]>[2] }
  ): void;
  function set<K extends keyof T>(
    key: K,
    val: T[K],
    payload?: Parameters<Options["setters"][K]>[2]
  ): void;

  function set(arg1: any, arg2: any, arg3?: any) {
    if (isObject(arg1)) {
      Object.entries(arg1).forEach(([key, val]) => {
        setFn(key, val, arg3[key]);
      });
    } else {
      setFn(arg1, arg2, arg3);
    }
  }
  return { state: readonly(_state), set, reset };
}

type ReactiveProxy<
  T extends UnwrapNestedRefs<object>,
  Options extends UseReactiveProxyOptions<T>,
> = ReturnType<typeof useReactiveProxy<T, Options>>;

function useCachedComputed<Key extends object, Value extends object>(): CachedComputedRef<
  Key,
  Value
> {
  const cache = new WeakMap<Key, Value>();
  const actKey = ref<Key | null>(null);
  const native = computed(() => cache.get(actKey.value));

  const customFn = {
    enable(key: Key) {
      if (cache.has(key)) {
        actKey.value = key;
      }
    },
    disable() {
      actKey.value = null;
    },
    set(key: Key, val: Value) {
      if (cache.has(key)) {
        return false;
      }
      cache.set(key, val);
      return true;
    },
    remove(key: Key) {
      cache.delete(key);
      if (actKey.value === key) {
        actKey.value = null;
      }
    },
  };
  return Object.assign(native, customFn);
}

export type { ReactiveProxy, CachedComputedRef };
export { useReactiveProxy, useCachedComputed };
