import { useData } from "vitepress";
import type { MaybeRefOrGetter } from "vue";
import { computed, onMounted, onUnmounted, toValue, watchEffect } from "vue";
import { flatArrayWithRoute, useSidebar } from "../use-index";

function useLayout() {
  const { page } = useData();

  const raw = useSidebar();
  const sidebar = computed(() => flatArrayWithRoute(raw.value));
  const hasSidebar = computed(() => !!sidebar.value && sidebar.value.length > 0);
  const hasToc = computed(() => page.value.headers.length > 0);
  return { hasToc, hasSidebar };
}

type LockStack = [count: number, overflow: string];
const stackCache = new WeakMap<HTMLElement, LockStack>();

function useLockScroll(
  isLock: MaybeRefOrGetter<boolean>,
  element: HTMLElement,
  onCleanup?: () => void
) {
  watchEffect((effectCleanup) => {
    const lock = toValue(isLock);
    const cache = stackCache.has(element)
      ? stackCache.get(element)
      : (() => {
          const created: LockStack = [0, element.style.overflow];
          stackCache.set(element, created);
          return created;
        })();

    if (lock) {
      cache[0]++;
      element.style.overflow = "hidden";
    } else {
      cache[0]--;
      if (cache[0] <= 0) {
        element.style.overflow = cache[1] || "";
        stackCache.delete(element);
        onCleanup?.();
      }
    }

    effectCleanup(() => {
      const cache = stackCache.get(element);
      if (cache) {
        element.style.overflow = cache[1] || "";
        stackCache.delete(element);
      }
      onCleanup?.();
    });
  });
}

export { useLayout, useLockScroll };
