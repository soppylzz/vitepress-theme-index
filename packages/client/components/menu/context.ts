import type { InjectionKey, Ref } from "vue";
import { computed, getCurrentInstance, inject, provide, ref } from "vue";
import type { IndexSize, MenuProps } from "../../types";

interface MenuContext {
  level: number;
  size: IndexSize;
  showActivate: boolean;
  parentKey: string;
  activeKey?: string;
  setActiveKey?: (key: string) => void;
}

const MenuContextKey: InjectionKey<Ref<MenuContext>> = Symbol("MenuContext");

function buildMenuKey(parent: string | null, uid: number) {
  return parent ? `${parent}-${uid}` : `${uid}`;
}

function createMenuContext<T extends MenuProps>(props?: T) {
  const activeKey = ref<string>();
  const context = computed<MenuContext>(() => {
    const { showActivate = false, size = "medium" } = props ?? {};
    return {
      level: 0,
      parentKey: "",
      activeKey: activeKey.value,
      setActiveKey: (key: string) => {
        activeKey.value = key;
      },
      showActivate,
      size,
    };
  });

  return { context, activeKey };
}
function provideMenuContext<T extends MenuProps>(props?: T) {
  const uid = getCurrentInstance()!.uid;
  const parent = inject<Ref<MenuContext>>(MenuContextKey, null);

  if (!parent) {
    const { context: root } = createMenuContext(props);
    provide(MenuContextKey, root);
    return;
  }

  const ctx = computed<MenuContext>(() => ({
    ...parent.value,
    level: (parent.value?.level ?? 0) + 1,
    parentKey: buildMenuKey(parent.value.parentKey, uid),
  }));
  provide(MenuContextKey, ctx);
}

function useMenuItem() {
  const uid = getCurrentInstance()!.uid;
  const ctx = inject<Ref<MenuContext>>(MenuContextKey);
  if (!ctx) {
    throw new Error("MenuContextKey is not found");
  }

  const size = computed(() => ctx?.value?.size ?? "medium");
  const key = computed(() => buildMenuKey(ctx.value.parentKey, uid));

  const showActivate = computed(() => ctx?.value?.showActivate ?? false);
  const isActive = computed(() => {
    if (!showActivate.value) return false;
    return ctx?.value?.activeKey === key.value;
  });

  return { key, ctx, isActive, size };
}

export type { MenuContext };
export { MenuContextKey, useMenuItem, provideMenuContext };
