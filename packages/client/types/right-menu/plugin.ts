import type {
  MenuTrigger,
  MenuMergeOrder,
  MenuMountMode,
  MenuSize,
  MenuItemState,
  MenuMode,
  MenuMergeMode,
} from "./unit";
import type { MenuItemRecord } from "./config";
import type { DeepReadonly, MaybePromise } from "@vitepress-theme-index/shared";
import type { ComponentInternalInstance, ComputedRef, Reactive, Ref } from "vue";
import type { CustomComputedRef, VueReadonly } from "../vue";
import type { EventProps } from "./base";

/* =============== menu config =============== */
interface StaticMenuConfig {
  preset: boolean;
  mode: MenuMode;
  mount?: MenuMountMode;
  trigger?: MenuTrigger;
}

interface BaseMenuConfig {
  order: MenuMergeOrder;
  merge: MenuMergeMode;
}

interface ProvideMenuConfig {
  size: MenuSize;
  state: MenuItemState;
}

const staticMenuConfigKeys: readonly (keyof StaticMenuConfig)[] = [
  "preset",
  "trigger",
  "mode",
  "mount",
] as const;
const baseMenuConfigKeys: readonly (keyof BaseMenuConfig)[] = ["order", "merge"] as const;
const provideMenuConfigKeys: readonly (keyof ProvideMenuConfig)[] = ["state", "size"] as const;

type IndexMenuContextConfig<Records extends MenuItemRecord = MenuItemRecord> = BaseMenuConfig &
  ProvideMenuConfig & { record: DeepReadonly<Records> };

type UserIndexRightMenuConfig<Records extends MenuItemRecord> = Partial<
  StaticMenuConfig & IndexMenuContextConfig<Records>
>;
type ResolvedIndexRightMenuConfig<Records extends MenuItemRecord> = Required<
  UserIndexRightMenuConfig<Records>
>;

/* =============== menu context =============== */
type MenuDynamicKey = HTMLElement | ComponentInternalInstance;
type WithContext<Config> = Config & { ctx: Reactive<Config>; reset(): void };

type MenuDynamicContext<Records extends MenuItemRecord = MenuItemRecord> = WithContext<
  Partial<IndexMenuContextConfig<Records>>
>;

type IndexMenuProvide = Partial<ProvideMenuConfig> & {
  path: string[];
  rect: [number, number];
};
type IndexMenuProvideHooks = { onClose?: () => void };
type IndexMenuProvideContext = {
  close(): void;
  ctx: ComputedRef<IndexMenuProvide>;
};

type MenuNavItem = Pick<EventProps, "selectable"> & {
  el: HTMLElement | null;
  render: boolean;
  onEnter?: (e: KeyboardEvent) => MaybePromise<void>;
};

type MenuNavContext = {
  nav: VueReadonly<
    Reactive<{
      actKey: Ref<string>;
      openKeys: Ref<string[]>;
      isActive: Ref<boolean>;
    }>
  >;
  blur(): void;
  reset(): void;
  close(): void;
  clear(): void;
};

type MenuGlobalManualContext = WithContext<Required<BaseMenuConfig & ProvideMenuConfig>> & {
  mode: "manual";
};

type CachedComputedRef<Key, Value> = CustomComputedRef<
  Value,
  {
    enable(key: Key): void;
    disable(key: Key): void;
    set(key: Key, val: Value): boolean;
    remove(key: Key): void;
  }
>;

type MenuGlobalDynamicContext<Records extends MenuItemRecord = MenuItemRecord> = WithContext<
  Required<IndexMenuContextConfig<Records>>
> & {
  mode: "mixed" | "auto";
  dynamic: CachedComputedRef<MenuDynamicKey, MenuDynamicContext>;
};

type IndexMenuGlobalContext<
  Records extends MenuItemRecord = MenuItemRecord,
  Mode extends MenuMode = MenuMode,
> = {
  auto: MenuGlobalDynamicContext<Records>;
  mixed: MenuGlobalDynamicContext<Records>;
  manual: MenuGlobalManualContext;
}[Mode] &
  MenuNavContext;

export { staticMenuConfigKeys, baseMenuConfigKeys, provideMenuConfigKeys };

export type {
  // config
  BaseMenuConfig,
  StaticMenuConfig,
  ProvideMenuConfig,
  IndexMenuContextConfig,
  UserIndexRightMenuConfig,
  ResolvedIndexRightMenuConfig,

  // context
  WithContext,
  MenuDynamicKey,
  MenuDynamicContext,
  IndexMenuGlobalContext,

  // nav
  MenuNavItem,
  MenuNavContext,

  // provider
  IndexMenuProvide,
  IndexMenuProvideHooks,
  IndexMenuProvideContext,
  CachedComputedRef,
};
