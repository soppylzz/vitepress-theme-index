import type { Component } from "vue";
import type { BaseProps, EventHooks, EventProps, ExpandHooks, BaseHooks } from "./base";
import type { IndexActivateEvent, IndexIcon, IndexText } from "../global";
import type { MenuItemAlign, MenuSize, MenuItemType } from "./unit";
import type { EmitsTypeFromHooks } from "../vue";

interface DividerItemProps extends /* @vue-ignore */ BaseProps {
  text?: IndexText;
  align?: MenuItemAlign;
}
interface GroupItemProps extends /* @vue-ignore */ EventProps {
  mode: "component" | "icon";
  text?: IndexText;
  row?: number;
  column?: number;
}
interface IconItemProps extends /* @vue-ignore */ EventProps {
  icon: IndexIcon;
  closeOnActivate?: boolean;
}
interface SubMenuItemProps extends /* @vue-ignore */ EventProps {
  text: IndexText;
  activateEvent?: IndexActivateEvent;
  align?: MenuItemAlign;
  icon?: IndexIcon;
  size?: MenuSize;
  expandIcon?: IndexIcon;
}
interface TextItemProps extends /* @vue-ignore */ EventProps {
  text: IndexText;
  icon?: IndexIcon;
  align?: MenuItemAlign;
  closeOnActivate?: boolean;
}

type TextItemHooks = EventHooks;
type IconItemHooks = EventHooks;
type GroupItemHooks = ExpandHooks;
type SubMenuItemHooks = ExpandHooks;

type GroupItemEmits = EmitsTypeFromHooks<GroupItemHooks>;
type IconItemEmits = EmitsTypeFromHooks<IconItemHooks>;
type SubMenuItemEmits = EmitsTypeFromHooks<SubMenuItemHooks>;
type TextItemEmits = EmitsTypeFromHooks<TextItemHooks>;

type BuildRMenuConfig<Type extends MenuItemType, Props extends object = never, Hooks = never> = {
  type: Type;
} & { hooks?: Hooks } & ([Props] extends [never] ? Record<string, never> : Props);

type HasChildConfig = { children?: MenuItemRecord };

type TextItemConfig = BuildRMenuConfig<"text", TextItemProps, TextItemHooks>;
type IconItemConfig = BuildRMenuConfig<"icon", IconItemProps, IconItemHooks>;
type DividerItemConfig = BuildRMenuConfig<"divider", DividerItemProps>;
type GroupItemConfig = BuildRMenuConfig<"group", GroupItemProps, GroupItemHooks> & HasChildConfig;
type SubMenuItemConfig = BuildRMenuConfig<"sub-menu", SubMenuItemProps, SubMenuItemHooks> &
  HasChildConfig;

type CustomItemConfig = BuildRMenuConfig<"custom"> & { component: Component };
type MenuItemConfig =
  | TextItemConfig
  | IconItemConfig
  | DividerItemConfig
  | GroupItemConfig
  | SubMenuItemConfig
  | CustomItemConfig;

type MenuItemRecord = { [k: string]: MenuItemConfig };

export type {
  // item base
  TextItemProps,
  IconItemProps,
  GroupItemProps,
  DividerItemProps,
  SubMenuItemProps,
  IconItemEmits,
  GroupItemEmits,
  TextItemEmits,
  SubMenuItemEmits,
  // item config
  TextItemConfig,
  IconItemConfig,
  DividerItemConfig,
  GroupItemConfig,
  SubMenuItemConfig,
  CustomItemConfig,
  // other
  MenuItemConfig,
  MenuItemRecord,
  HasChildConfig,
};
