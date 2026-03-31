import type { InjectionKey, Ref } from "vue";
import { computed, getCurrentInstance, inject, provide, ref } from "vue";

interface MenuContext {
  level: number;
  parentKey: string;
  showActivate: boolean;
  activeKey?: string;
  setActiveKey?: (key: string) => void;
}

const MenuContextKey: InjectionKey<Ref<MenuContext>> = Symbol("MenuContext");

function createMenuContext(showActivate: boolean) {
  const activeKey = ref<string>();

  const context = computed<MenuContext>(() => ({
    level: 0,
    parentKey: "",
    activeKey: activeKey.value,
    setActiveKey: (key: string) => {
      activeKey.value = key;
    },
    showActivate,
  }));

  return {
    context,
    activeKey,
  };
}
function provideMenuContext(showActivate?: boolean) {
  const uid = getCurrentInstance()!.uid;
  const parentContext = inject<Ref<MenuContext>>(MenuContextKey, null);

  if (!parentContext) {
    const { context: root } = createMenuContext(showActivate ?? false);
    provide(MenuContextKey, root);
    return root;
  }
  const newParentKey = uid
    ? parentContext.value?.parentKey
      ? `${parentContext.value.parentKey}-${uid}`
      : String(uid)
    : (parentContext.value?.parentKey ?? "");

  const ctx = computed<MenuContext>(() => ({
    level: (parentContext.value?.level ?? 0) + 1,
    showActivate: parentContext.value?.showActivate ?? false,
    activeKey: parentContext.value?.activeKey,
    setActiveKey: parentContext.value?.setActiveKey,
    parentKey: newParentKey,
  }));
  provide(MenuContextKey, ctx);
  return ctx;
}

function useMenuItem() {
  const instance = getCurrentInstance();
  const uid = instance?.uid ?? Math.random();
  const menuContext = inject<Ref<MenuContext>>(MenuContextKey);

  const itemKey = computed(() => {
    const parentKey = menuContext?.value?.parentKey ?? "";
    return parentKey ? `${parentKey}-${uid}` : String(uid);
  });

  const showActivate = computed(() => menuContext?.value?.showActivate ?? false);
  const isActive = computed(() => {
    if (!showActivate.value) return false;
    return menuContext?.value?.activeKey === itemKey.value;
  });

  return { itemKey, menuContext, showActivate, isActive };
}

export type { MenuContext };
export { MenuContextKey, useMenuItem, provideMenuContext };
