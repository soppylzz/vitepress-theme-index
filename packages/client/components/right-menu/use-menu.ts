import type { ComponentInternalInstance, MaybeRef } from "vue";
import { getCurrentInstance, inject, onMounted, onUnmounted, provide, toValue, watch } from "vue";
import { useNavState, useRightMenuProvide } from "../../utils";
import { rightMenuPrivateKey } from "../../types";
import { rightMenuLogger } from "@vitepress-theme-index/shared";

const closerCache = new Map<string, Record<string, HTMLElement>>();

function generateKey(ins: ComponentInternalInstance) {
  return `closer-${ins.uid}`;
}

function useRightMenuRoot(render: MaybeRef<boolean>) {
  const ins = getCurrentInstance()!;
  const key = generateKey(ins);

  provide(rightMenuPrivateKey, key);
  const { set } = useNavState();
  const close = useRightMenuProvide().close!;

  watch(
    () => toValue(render),
    (val) => {
      set(val);
    },
    { immediate: true }
  );

  const isInside = (cache: Record<string, HTMLElement> | undefined, e: MouseEvent) =>
    Object.values(cache || {}).some((dom) => dom?.contains(e.target as Node));

  const clickFn = (e: MouseEvent) => {
    if (!toValue(render)) return;

    const cache = closerCache.get(key);
    if (isInside(cache, e)) return;
    close();
  };
  const keyboardFn = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !toValue(render)) return;
    close();
  };
  const contextFn = (e: MouseEvent) => {
    if (!toValue(render)) return;

    const cache = closerCache.get(key);
    if (!isInside(cache, e)) return;
    e.preventDefault();
    e.stopPropagation();
  };

  let isInstallEvent: boolean = false;
  onMounted(() => {
    const el = ins?.proxy?.$el;
    if (el instanceof HTMLElement) {
      isInstallEvent = true;
      closerCache.set(key, { [key]: el });
      window.addEventListener("click", clickFn);
      window.addEventListener("keydown", keyboardFn);
      window.addEventListener("contextmenu", contextFn, { capture: true });
    } else {
      rightMenuLogger.error("`useRightMenuRoot` does not support fragment components");
    }
  });
  onUnmounted(() => {
    if (isInstallEvent) {
      closerCache.delete(key);
      window.removeEventListener("click", clickFn);
      window.removeEventListener("keydown", keyboardFn);
      window.removeEventListener("contextmenu", contextFn, { capture: true });
    }
  });
}

function useRightMenuChild(..._: any[]) {
  const ins = getCurrentInstance()!;
  const root = inject(rightMenuPrivateKey);
  const key = generateKey(ins);

  if (!root) {
    rightMenuLogger.error("unable to find root key in rightMenuChild");
  }

  let isInstallEvent: boolean = false;

  onMounted(() => {
    const el = ins?.proxy?.$el;
    if (el instanceof HTMLElement) {
      isInstallEvent = true;
      const parentCache = closerCache.get(root) ?? {};
      parentCache[key] = el;
      closerCache.set(root, parentCache);
    } else {
      rightMenuLogger.error("`useRightMenuChild` does not support fragment components");
    }
  });
  onUnmounted(() => {
    if (isInstallEvent) {
      const parentCache = closerCache.get(root);
      if (parentCache) {
        delete parentCache[key];
      }
    }
  });
}

function useRightMenu(render: MaybeRef<boolean>) {
  const ctx = inject(rightMenuPrivateKey, null);
  const isRoot = !ctx;
  const useFn = isRoot ? useRightMenuRoot : useRightMenuChild;
  useFn(render);
  return { isRoot };
}

export { useRightMenu };
