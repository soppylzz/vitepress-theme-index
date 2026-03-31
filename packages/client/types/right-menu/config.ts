import type { Component } from "vue";
import type { RMenuBaseProps, RMenuEventHooks, RMenuEventProps, RMenuExpandHooks } from "./base";
import type { IndexActivateEvent, IndexIcon, IndexSize, IndexText } from "../global";
import type { MenuItemAlign } from "./unit";
import type { EmitsTypeFromHooks } from "../vue";

interface RMenuDividerProps extends /* @vue-ignore */ RMenuBaseProps {
  text?: IndexText;
  align?: MenuItemAlign;
}
interface RMenuGroupProps extends /* @vue-ignore */ RMenuEventProps {
  mode: "component" | "icon";
  text?: IndexText;
  row?: number;
  column?: number;
}
interface RMenuIconProps extends /* @vue-ignore */ RMenuEventProps {
  icon: IndexIcon;
  closeOnActivate?: boolean;
}
interface RMenuSubMenuProps extends /* @vue-ignore */ RMenuEventProps {
  text: IndexText;
  activateEvent?: IndexActivateEvent;
  align?: MenuItemAlign;
  icon?: IndexIcon;
  size?: IndexSize;
  expandIcon?: IndexIcon;
}
interface RMenuTextProps extends /* @vue-ignore */ RMenuEventProps {
  text: IndexText;
  icon?: IndexIcon;
  align?: MenuItemAlign;
  closeOnActivate?: boolean;
}

type RMenuTextHooks = RMenuEventHooks;
type RMenuIconHooks = RMenuEventHooks;
type RMenuGroupHooks = RMenuExpandHooks;
type RMenuSubMenuHooks = RMenuExpandHooks;

type RMenuTextEmits = /* @vue-ignore */ EmitsTypeFromHooks<RMenuTextHooks>;
type RMenuIconEmits = /* @vue-ignore */ EmitsTypeFromHooks<RMenuIconHooks>;
type RMenuGroupEmits = /* @vue-ignore */ EmitsTypeFromHooks<RMenuGroupHooks>;
type RMenuSubMenuEmits = /* @vue-ignore */ EmitsTypeFromHooks<RMenuSubMenuHooks>;

type BuildRMenuConfig<Type extends RMenuItemType, Props extends object = never, Hooks = never> = {
  type: Type;
} & { hooks?: Hooks } & ([Props] extends [never] ? {} : Props);

type HasChildConfig = { children?: RMenuItemRecord };

type RMenuTextConfig = BuildRMenuConfig<"text", RMenuTextProps, RMenuTextHooks>;
type RMenuIconConfig = BuildRMenuConfig<"icon", RMenuIconProps, RMenuIconHooks>;
type RMenuDividerConfig = BuildRMenuConfig<"divider", RMenuDividerProps>;
type RMenuGroupConfig = BuildRMenuConfig<"group", RMenuGroupProps, RMenuGroupHooks> &
  HasChildConfig;
type RMenuSubMenuConfig = BuildRMenuConfig<"sub-menu", RMenuSubMenuProps, RMenuSubMenuHooks> &
  HasChildConfig;

type RMenuCustomConfig = BuildRMenuConfig<"custom"> & { component: Component };
type RMenuItemConfig =
  | RMenuTextConfig
  | RMenuIconConfig
  | RMenuDividerConfig
  | RMenuGroupConfig
  | RMenuSubMenuConfig
  | RMenuCustomConfig;
type RMenuItemType = RMenuItemConfig["type"];

type RMenuItemRecord = { [k: string]: RMenuItemConfig };

export type {
  RMenuItemType,
  // item base
  RMenuTextProps,
  RMenuIconProps,
  RMenuGroupProps,
  RMenuDividerProps,
  RMenuSubMenuProps,
  RMenuTextEmits,
  RMenuIconEmits,
  RMenuGroupEmits,
  RMenuSubMenuEmits,
  // item config
  RMenuTextConfig,
  RMenuIconConfig,
  RMenuDividerConfig,
  RMenuGroupConfig,
  RMenuSubMenuConfig,
  RMenuCustomConfig,
  // other
  RMenuItemConfig,
  RMenuItemRecord,
  HasChildConfig,
};
