import type { MenuContext, MenuProps, MenuState } from "../../types";
import { localMenuKey } from "../../types";
import { computed, getCurrentInstance, inject, provide, ref, toValue } from "vue";
import { useInject } from "../use-inject";

function buildMenuKey(parent: string | null, uid: number) {
  return parent ? `${parent}-${uid}` : `${uid}`;
}

function mergeMenuProps<T extends MenuProps>(
  raw: MenuProps | null,
  mix?: Partial<T>
): Required<MenuProps> {
  return {
    ...mix,
    size: mix?.size || raw?.size || "medium",
    collapsed: mix?.collapsed ?? raw?.collapsed ?? true,
    showActivate: mix?.showActivate ?? raw?.showActivate ?? true,
  };
}

function createMenuContext<T extends MenuProps>(props?: Partial<T>): MenuContext {
  const activeKey = ref<string>();
  function setActive(key: string) {
    activeKey.value = key;
  }

  const ctx = computed(
    () =>
      ({
        level: 0,
        parentKey: "",
        activeKey: activeKey.value,
        ...mergeMenuProps(null, props),
      }) as MenuState
  );

  return { ctx, setActive };
}

function provideMenuContext<T extends MenuProps>(props?: T) {
  const uid = getCurrentInstance()!.uid;
  const parent = inject(localMenuKey, null);

  if (!parent) {
    provide(localMenuKey, createMenuContext(props));
    return;
  }

  const { setActive, ctx } = parent;
  const wrapCtx = computed(() => {
    const raw = toValue(ctx);
    return {
      ...raw,
      level: (raw?.level ?? 0) + 1,
      parentKey: buildMenuKey(raw.parentKey, uid),
      ...mergeMenuProps(raw, props),
    };
  });

  provide(localMenuKey, { setActive, ctx: wrapCtx });
}

function useMenuItem() {
  const uid = getCurrentInstance()!.uid;
  const { setActive, ctx } = useInject(localMenuKey)!;

  const ctxRef = computed(() => toValue(ctx));
  const key = computed(() => buildMenuKey(ctxRef.value.parentKey, uid));

  const isActive = computed(() => {
    if (!ctxRef.value.showActivate) return false;
    return ctxRef.value.activeKey === key.value;
  });

  return { key, isActive, ctx: ctxRef, setActive: () => setActive(key.value) };
}

export { useMenuItem, provideMenuContext };
