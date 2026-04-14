import type { MaybeRefOrGetter } from "vue";
import {
  computed,
  getCurrentInstance,
  onMounted,
  shallowRef,
  toValue,
  watch,
  watchEffect,
} from "vue";
import type {
  RMenuEventHooks,
  MenuNavItem,
  MenuItemNavState,
  ToMaybeRefOrGetterState,
  RMenuBaseProps,
  MenuItemState,
} from "../../types";
import { navSeparator } from "../../types";
import {
  useTrigger,
  useNavWriter,
  useMenuNav,
  provideRightMenuContext,
  useRightMenuProvide,
  parentKeyOf,
} from "../../utils";
import { rightMenuLogger } from "@vitepress-theme-index/shared";

type MenuNavOption = Parameters<typeof useTrigger>[1] & {
  onSelect?: RMenuEventHooks["select"];
} & Omit<ToMaybeRefOrGetterState<Partial<MenuNavItem>, "render" | "selectable">, "el"> & {
    autoRegister?: boolean;
    state?: MaybeRefOrGetter<MenuItemState>;
  };

function useRMenuItem(props?: Partial<RMenuBaseProps>, option?: MenuNavOption) {
  const ins = getCurrentInstance()!;

  const {
    autoRegister = true,
    selectable = false,
    state: state_ = undefined,
    render: render_ = true,
    onEnter = () => {},
    onSelect = () => {},
    ...hooks
  } = option || {};

  const { ctx } = useRightMenuProvide();
  const { trigger } = useTrigger(props, hooks);
  if (!ctx) {
    rightMenuLogger.error("useRMenuItem required ctx");
    return;
  }

  const size = computed(() => ctx.value.size ?? "medium");
  const state = computed(() => {
    const raw = toValue(state_);
    if (raw === "disabled") return "disabled";
    return raw || ctx.value.state;
  });

  const key = computed(() => [...ctx.value.path, ins.uid].join(navSeparator));
  const render = computed(() => {
    return trigger.value && (toValue(render_) ?? false);
  });

  const { nav, blur } = useMenuNav();
  const { set, delete_, enable } = useNavWriter();

  watch(
    () => nav.actKey,
    (newKey) => {
      if (newKey === key.value) onSelect?.();
    }
  );

  const el = shallowRef<HTMLElement | null>(null);

  onMounted(() => {
    if (el.value) return;
    const el_ = ins.proxy?.$el;
    if (el_ && el_ instanceof HTMLElement) {
      el.value = el_;
    } else {
      rightMenuLogger.error("`useMenuNav` does not support fragment components");
    }
  });

  watchEffect((onCleanup) => {
    const currentKey = key.value;
    set(currentKey, {
      el: el.value,
      onEnter,
      render: render.value,
      selectable: state.value === "enabled" && toValue(selectable),
    });
    onCleanup(() => delete_(currentKey));
  });

  let isEnabled: boolean = false;
  const enter = () => {
    if (!nav.blockMouse) {
      enable(key.value);
      isEnabled = true;
    }
  };
  const move = () => {
    if (!isEnabled) {
      enable(key.value);
      isEnabled = true;
    }
  };
  const leave = () => {
    if (nav.blockMouse) return;
    blur();
  };

  if (autoRegister) {
    watchEffect((onCleanup) => {
      const el_ = el.value;
      if (el_ instanceof HTMLElement) {
        el_.addEventListener("mouseenter", enter);
        el_.addEventListener("mouseleave", leave);
        el_.addEventListener("mousemove", move);
        onCleanup(() => {
          el_.removeEventListener("mouseenter", enter);
          el_.removeEventListener("mouseleave", leave);
          el_.removeEventListener("mousemove", move);
        });
      }
    });
  }

  const opened = computed(() => parentKeyOf(nav.actKey).startsWith(key.value));
  const stage = computed<MenuItemNavState>(() =>
    key.value === nav.actKey ? "selected" : "unselect"
  );

  return { render, state, stage, opened, size, enter, leave };
}

function useProvidePath(...[provides, hooks, _]: Parameters<typeof provideRightMenuContext>) {
  const ins = getCurrentInstance();
  if (!ins) {
    rightMenuLogger.error("`useMenuNav` must be used in setup script");
    return;
  }

  const { ctx } = useRightMenuProvide()!;
  provideRightMenuContext(
    {
      ...provides,
      path: () => [...ctx!.value.path, `${ins.uid}`],
    },
    hooks
  );
}

export { useRMenuItem, useProvidePath };
