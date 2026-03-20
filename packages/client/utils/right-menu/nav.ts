import type { App, WatchCallback } from "vue";
import { computed, reactive, readonly, ref, watch } from "vue";
import { isBoolean } from "lodash-unified";
import { ensureArray, type HTMLElementTagName } from "@vitepress-theme-index/shared";
import type { MenuNavContext, MenuNavItem, MenuTrigger } from "../../types";
import { navSeparator } from "../../types";

/* =============== nav states =============== */
let isNavInstalled = false;

const currentEventPath = ref<EventTarget[] | null>(null);
const navItems = new Map<string, MenuNavItem>();

const actKey = ref("");
const openKeys = ref<string[]>([]);
const isActive = ref<boolean>(false);

/* =============== nav utils =============== */
function matchTrigger(path: EventTarget[], trigger: MenuTrigger) {
  if (isBoolean(trigger)) return trigger;

  const triggers = ensureArray(trigger);
  const tageNames = path.map((node) => {
    if (!(node instanceof HTMLElement)) return false;
    return node.tagName.toLowerCase() as HTMLElementTagName;
  });
  return triggers.some((trigger) => tageNames.includes(trigger));
}

function useNavState() {
  const set = (val: boolean) => (isActive.value = val);
  return { isActive: readonly(isActive), set };
}

function useNavCleaner() {
  const blur = () => {
    actKey.value = "";
    openKeys.value.pop();
  };
  const reset = () => {
    actKey.value = "";
    openKeys.value = [];
  };
  const close = () => {
    reset();
    isActive.value = false;
    currentEventPath.value = null;
  };
  const clear = () => {
    close();
    navItems.clear();
  };
  return { blur, reset, close, clear };
}

function useNavWriter() {
  const { blur } = useNavCleaner();
  const enable = (key: string) => {
    if (!navItems.has(key)) return;
    actKey.value = key;
    openKeys.value.push(key);
  };
  const set = (key: string, value: MenuNavItem) => {
    navItems.set(key, value);
  };
  const delete_ = (key: string) => {
    navItems.delete(key);
    if (actKey.value === key) blur();
  };
  return { enable, set, delete_ };
}

function parentKeyOf(key: string) {
  const i = key.lastIndexOf(navSeparator);
  return i === -1 ? "" : key.slice(0, i);
}

function isSelectable(item: MenuNavItem) {
  return item.el instanceof HTMLElement && item.render && item?.selectable;
}

function compareItem(a: [string, MenuNavItem], b: [string, MenuNavItem]) {
  const [aDom, bDom] = [a[1].el, b[1].el];

  if (!aDom || !bDom) return 0;
  const pos = aDom.compareDocumentPosition(bDom);
  if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
  if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
  return 0;
}

function getSiblings(key: string) {
  const parent = parentKeyOf(key);
  return Array.from(navItems.entries())
    .filter(([k, item]) => k === actKey.value || (parentKeyOf(k) === parent && isSelectable(item)))
    .sort(compareItem);
}

function firstEnabled() {
  const roots = Array.from(navItems)
    .filter(([k, item]) => isSelectable(item))
    .sort(compareItem);

  if (!roots.length) return;
  return roots[0][0];
}

function useNavMove() {
  function moveSibling(direction: -1 | 1) {
    const ack = actKey.value;
    const { blur } = useNavCleaner();
    const { enable } = useNavWriter();
    if (!ack) {
      const first = firstEnabled();
      if (first) {
        blur();
        enable(first);
      }
      return;
    }

    const siblings = getSiblings(ack);
    if (siblings.length <= 1) return;

    const index = siblings.findIndex(([k]) => k === ack);
    const next = (index + direction + siblings.length) % siblings.length;
    blur();
    enable(siblings[next][0]);
  }

  function enterChild() {
    const parent = actKey.value;
    const { blur } = useNavCleaner();
    const { enable } = useNavWriter();

    if (!parent) return;
    const children = Array.from(navItems.entries())
      .filter(([k, item]) => parentKeyOf(k) === parent && isSelectable(item))
      .sort(compareItem);
    if (!children.length) return;
    blur();
    enable(children[0][0]);
  }

  function leaveParent() {
    const parent = parentKeyOf(actKey.value);
    const { blur } = useNavCleaner();
    const { enable } = useNavWriter();

    if (parent) {
      blur();
      enable(parent);
    }
  }
  return { moveSibling, enterChild, leaveParent };
}

/* =============== nav exposes =============== */
function installMenuNav(app: App) {
  if (import.meta.env.SSR) return;

  const triggerFn = (e: MouseEvent) => {
    currentEventPath.value = e.composedPath();
  };

  const keyboardFn = async (e: KeyboardEvent) => {
    if (!isActive.value) return;

    const { moveSibling, enterChild, leaveParent } = useNavMove();
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        moveSibling(1);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        moveSibling(-1);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        enterChild();
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        leaveParent();
        break;
      }
      case "Enter": {
        if (!actKey.value) return;
        const item = navItems.get(actKey.value);
        await item?.onEnter?.(e);
        break;
      }
    }
  };

  if (!isNavInstalled) {
    isNavInstalled = true;
    window.addEventListener("keydown", keyboardFn);
    window.addEventListener("contextmenu", triggerFn, { capture: true });
    app.onUnmount(() => {
      window.removeEventListener("keydown", keyboardFn);
      window.removeEventListener("contextmenu", triggerFn, { capture: true });
      currentEventPath.value = null;
    });
  }
}

function useTrigger<T extends { trigger?: MenuTrigger }>(
  props: T,
  options?: {
    onChanged?: WatchCallback<boolean, boolean>;
  }
) {
  const { onChanged = () => {} } = options || {};

  const triggerRef = computed(() => {
    const path = currentEventPath.value;
    const _trigger = props?.trigger ?? true;

    return path ? matchTrigger(path, _trigger) : false;
  });
  watch(triggerRef, onChanged);
  return { trigger: triggerRef };
}

function useMenuNav(): MenuNavContext {
  return {
    nav: readonly(
      reactive({
        actKey,
        openKeys,
        isActive,
      })
    ),
    ...useNavCleaner(),
  };
}

export {
  installMenuNav,
  useTrigger,
  useMenuNav,
  // private method, only public in the project
  useNavWriter,
  useNavState,
  useNavMove,
};
