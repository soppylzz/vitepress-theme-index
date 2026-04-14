import type { InjectionKey } from "vue";
import { inject } from "vue";
import { isNull, isUndefined } from "lodash-unified";
import { injectLogger } from "@vitepress-theme-index/shared";

function useInject<T>(key: string | InjectionKey<T>, defaultVal?: T, errMsg?: string) {
  const val = inject(key);
  if (isUndefined(val) || isNull(val)) {
    if (!isUndefined(defaultVal)) return defaultVal;
    injectLogger.error(errMsg || `inject failed, unable to find ${String(key)} provides`);
  }
  return val!;
}

export { useInject };
