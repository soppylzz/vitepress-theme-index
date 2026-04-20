import type { ComputedRef, MaybeRefOrGetter, UnwrapNestedRefs } from "vue";
import { toValue, computed, reactive, readonly, ref, watch } from "vue";
import { isObject, isUndefined } from "lodash-unified";
import {
  clearObject,
  hasOwnProperty,
  IndexError,
  injectLogger,
} from "@vitepress-theme-index/shared";
import type { CachedComputedRef } from "../types";

interface UseReactiveProxyOptions<T extends object> {
  setters?: {
    [K in keyof T]?: (old: T[K] | undefined, val: T[K] | undefined, payload?: any) => T[K];
  };
  getters?: { [K in keyof T]?: (source?: T[K] | undefined, override?: T[K] | undefined) => T[K] };
}

function useReactiveProxy<T extends object, Options extends UseReactiveProxyOptions<T>>(
  source: UnwrapNestedRefs<T>,
  options?: Options
) {
  const proxy = reactive<Record<string, any>>({});
  const _state = reactive<UnwrapNestedRefs<T>>({ ...source });

  const { setters = {}, getters = {} } = options || {};

  function setFn(key: any, val: any, payload?: any) {
    proxy[key] = hasOwnProperty(setters, key)
      ? (setters as any)[key](proxy[key], val, payload)
      : val;
  }

  function getFn(key: any) {
    (_state as any)[key] = hasOwnProperty(getters, key)
      ? (getters as any)[key]((source as any)[key], proxy[key])
      : isUndefined(proxy[key])
        ? proxy[key]
        : (source as any)[key];
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

  function set(obj: Partial<T>, payloads?: any): void;
  function set<K extends keyof T>(key: K, val: T[K], payload?: any): void;
  function set(arg1: any, arg2: any, arg3?: any) {
    if (isObject(arg1)) {
      Object.entries(arg1).forEach(([key, val]) => {
        setFn(key, val, arg2?.[key]);
      });
    } else {
      setFn(arg1, arg2, arg3);
    }
  }
  return { state: readonly(_state), set, reset };
}

function useCachedComputed<Key extends object, Value extends object>(): CachedComputedRef<
  Key,
  Value
> {
  const cache = new WeakMap<Key, Value>();
  const actKey = ref<Key | null>(null);
  const native = computed(() => cache.get(actKey.value)) as CachedComputedRef<Key, Value>;

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

function useSplitRefs<T extends object>(val: MaybeRefOrGetter<T | undefined>) {
  const initial = toValue(val);
  if (!initial) return {} as { [K in keyof T]: undefined };

  const initialKeys = Object.keys(initial);
  const result = {} as { [K in keyof T]?: ComputedRef<T[K]> | undefined };

  for (const key of initialKeys) {
    result[key as keyof T] = computed(() => {
      const target = toValue(val)!;
      return target[key as keyof T];
    });
  }

  function checkKeys(target: object) {
    for (const key of initialKeys) {
      if (!(key in target)) {
        injectLogger.error(`missing key: ${key}, do not modify structure!`);
      }
    }
    if (Object.keys(target).length !== initialKeys.length) {
      injectLogger.error(`key count changed, do not modify structure!`);
    }
  }

  watch(() => toValue(val), checkKeys, { deep: false });
  return result;
}

/* ==================== vue validators ==================== */
function createNumValidator(mode: "positive" | "negative" | "non-positive" | "non-negative") {
  const map = {
    positive: (v: number) => v > 0,
    negative: (v: number) => v < 0,
    "non-positive": (v: number) => v <= 0,
    "non-negative": (v: number) => v >= 0,
  };
  return map[mode];
}

export type { CachedComputedRef };
export { useReactiveProxy, useCachedComputed, useSplitRefs, createNumValidator };
