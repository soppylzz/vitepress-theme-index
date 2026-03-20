import type { ComponentInternalInstance, MaybeRef } from "vue";
import { getCurrentInstance, inject, onMounted, onUnmounted, provide, toValue, watch } from "vue";
import { useMenuNav, useNavState, useRightMenuProvide } from "../../utils";
import { rightMenuPrivateKey } from "../../types";

const closerCache = new Map<string, Record<string, HTMLElement>>();

function generateKey(ins: ComponentInternalInstance) {
  return `closer-${ins.uid}`;
}

function useRightMenuRoot(render: MaybeRef<boolean>) {
  const ins = getCurrentInstance()!;
  const key = generateKey(ins);

  provide(rightMenuPrivateKey, key);
  const { set } = useNavState();
  const { close } = useRightMenuProvide();
  const { reset } = useMenuNav();

  watch(
    () => toValue(render),
    (val) => {
      set(val);
    },
    { immediate: true }
  );

  const isInside = (cache: Record<string, HTMLElement>, e: MouseEvent) =>
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

  onMounted(() => {
    const el: HTMLElement = ins.proxy.$el!;
    if (!(el instanceof HTMLElement)) {
      throw new Error("useRightMenuRoot does not support fragment components");
    }
    closerCache.set(key, { [key]: el });
    window.addEventListener("click", clickFn);
    window.addEventListener("keydown", keyboardFn);
    window.addEventListener("contextmenu", contextFn, { capture: true });
  });
  onUnmounted(() => {
    closerCache.delete(key);
    window.removeEventListener("click", clickFn);
    window.removeEventListener("keydown", keyboardFn);
    window.removeEventListener("contextmenu", contextFn, { capture: true });
  });
}

function useRightMenuChild(..._: any[]) {
  const ins = getCurrentInstance()!;
  const key = generateKey(ins);
  const root = inject(rightMenuPrivateKey);

  onMounted(() => {
    const el: HTMLElement = ins.proxy.$el!;
    if (!(el instanceof HTMLElement)) {
      throw new Error("useRightMenuChild does not support fragment components");
    }
    const parentCache = closerCache.get(root) ?? {};
    parentCache[key] = el;
    closerCache.set(root, parentCache);
  });
  onUnmounted(() => {
    const parentCache = closerCache.get(root);
    if (parentCache) {
      delete parentCache[key];
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
