import type { MaybeRefOrGetter } from "vue";
import { onMounted, onUnmounted, toValue, watchEffect } from "vue";
import type { KeydownEventItem } from "../../types";
import { keydownManager } from "./manager";
import { isUndefined } from "lodash-unified";

function useKeydown(item: KeydownEventItem) {
  const id = keydownManager.register(item);
  function cleanup() {
    keydownManager.unregister(id);
  }
  function reset() {
    keydownManager.destroy();
  }
  return { cleanup, reset, id };
}

function useScope(scope: string = "global", trigger?: MaybeRefOrGetter<boolean>) {
  let cleanup: null | (() => void) = null;

  if (isUndefined(trigger)) {
    onMounted(() => {
      keydownManager.pushScope(scope);
    });
    onUnmounted(() => {
      keydownManager.popScope(scope);
    });
  } else {
    let wasActive: boolean | undefined;
    const handler = watchEffect((onCleanup) => {
      const active = toValue(trigger);
      if (active && !wasActive) {
        keydownManager.pushScope(scope);
      } else if (!active && wasActive) {
        keydownManager.popScope(scope);
      }
      wasActive = active;
      onCleanup(() => {
        if (wasActive) {
          keydownManager.popScope(scope);
          wasActive = false;
        }
      });
    });

    cleanup = handler.stop;
  }

  return { cleanup };
}

export { useKeydown, useScope };
