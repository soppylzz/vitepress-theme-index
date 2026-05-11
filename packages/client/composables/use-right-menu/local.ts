import {
  getCurrentInstance,
  inject,
  onMounted,
  onUnmounted,
  provide,
  toValue,
  watchEffect,
} from "vue";
import type { ComponentInternalInstance, MaybeRef } from "vue";
import { useKeydown, useNavState, useRightMenuProvide, useScope } from "../../utils";
import { rightMenuItemScope, localRightMenuKey } from "../../types";
import { rightMenuLogger } from "@vitepress-theme-index/shared";

const closerCache = new Map<string, Record<string, HTMLElement>>();

function generateKey(ins: ComponentInternalInstance) {
  return `closer-${ins.uid}`;
}

function useRightMenuRoot(render: MaybeRef<boolean>) {
  const ins = getCurrentInstance()!;
  const key = generateKey(ins);

  provide(localRightMenuKey, key);
  const { set } = useNavState();
  const close = useRightMenuProvide().close!;

  watchEffect(() => {
    set(toValue(render));
  });

  const isInside = (cache: Record<string, HTMLElement> | undefined, e: MouseEvent) =>
    Object.values(cache || {}).some((dom) => dom?.contains(e.target as Node));

  const clickFn = (e: MouseEvent) => {
    if (!toValue(render)) return;

    const cache = closerCache.get(key);
    if (isInside(cache, e)) return;
    close();
  };
  const contextFn = (e: MouseEvent) => {
    if (!toValue(render)) return;

    const cache = closerCache.get(key);
    if (!isInside(cache, e)) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const { cleanup: cleanScope } = useScope(rightMenuItemScope, () => toValue(render));
  const { cleanup: cleanItem } = useKeydown({
    key: "Escape",
    scope: rightMenuItemScope,
    handler() {
      close();
    },
  });

  onMounted(() => {
    const el = ins?.proxy?.$el;
    if (!(el instanceof HTMLElement)) {
      rightMenuLogger.error("`useRightMenuRoot` does not support fragment components");
    }

    closerCache.set(key, { [key]: el });
    window.addEventListener("click", clickFn);
    window.addEventListener("contextmenu", contextFn, { capture: true });

    onUnmounted(() => {
      cleanItem();
      cleanScope();
      closerCache.delete(key);
      window.removeEventListener("click", clickFn);
      window.removeEventListener("contextmenu", contextFn, { capture: true });
    });
  });
}

function useRightMenuChild(..._: any[]) {
  const ins = getCurrentInstance()!;
  const root = inject(localRightMenuKey);
  const key = generateKey(ins);

  if (!root) {
    rightMenuLogger.error("unable to find root key in rightMenuChild");
  }

  onMounted(() => {
    const el = ins?.proxy?.$el;
    if (!(el instanceof HTMLElement)) {
      rightMenuLogger.error("`useRightMenuChild` does not support fragment components");
    }

    const parentCache = closerCache.get(root) ?? {};
    parentCache[key] = el;
    closerCache.set(root, parentCache);

    onUnmounted(() => {
      const parentCache = closerCache.get(root);
      if (parentCache) {
        delete parentCache[key];
      }
    });
  });
}

function useRightMenu(render: MaybeRef<boolean>) {
  const ctx = inject(localRightMenuKey, null);
  const isRoot = !ctx;
  const useFn = isRoot ? useRightMenuRoot : useRightMenuChild;
  useFn(render);
  return { isRoot };
}

export { useRightMenu };
