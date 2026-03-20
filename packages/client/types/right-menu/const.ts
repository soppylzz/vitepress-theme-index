import type { MenuItemRecord } from "./config";
import type { DeepReadonly, WithDefault } from "@vitepress-theme-index/shared";
import type {
  BaseMenuConfig,
  IndexMenuGlobalContext,
  IndexMenuProvideContext,
  ProvideMenuConfig,
  StaticMenuConfig,
} from "./plugin";
import type { InjectionKey } from "vue";

const navSeparator = "/";

const rightMenuPrivateKey: InjectionKey<string | null> = Symbol("rightMenuPrivateContext");

const indexRightMenuGlobalKey: InjectionKey<IndexMenuGlobalContext> =
  Symbol("indexRightMenuGlobalKey");
const indexRightMenuProvideKey: InjectionKey<Partial<IndexMenuProvideContext>> = Symbol(
  "indexRightMenuProvideKey"
);
const defaultMenuConfig: Required<StaticMenuConfig & BaseMenuConfig & ProvideMenuConfig> = {
  trigger: true,
  preset: true,
  size: "small",
  mode: "auto",
  merge: "attach",
  mount: "keep-alive",
  order: "static-first",
  state: "enabled",
};

const defaultMenuItemRecord = {
  quick: {
    type: "group",
    mode: "icon",
    column: 4,
    children: {
      back: { type: "icon", icon: "angle-left" },
      next: { type: "icon", icon: "angle-right" },
      top: { type: "icon", icon: "arrow-up" },
      renew: { type: "icon", icon: "arrow-rotate-left" },
    },
  },
  group: {
    type: "group",
    mode: "component",
    text: "按键组",
    children: {
      text: { type: "text", icon: "angle-left", text: "按键" },
      text2: { type: "text", icon: "angle-left", text: "按键" },
    },
  },
  divider: {
    type: "divider",
    text: "分割线",
    align: "start",
  },
  expand: {
    type: "sub-menu",
    text: "子菜单",
    activateEvent: "click",
    icon: "angle-left",
    expandIcon: "angle-left",
    size: "medium",
    children: {
      text: { type: "text", icon: "angle-left", text: "按键" },
      text2: { type: "text", icon: "angle-left", text: "按键" },
    },
  },
  text2: { type: "text", icon: "angle-left", text: "按键" },
} as const satisfies DeepReadonly<MenuItemRecord>;

type WithDefaultMenuRecord<T extends MenuItemRecord> = WithDefault<T, typeof defaultMenuItemRecord>;

export {
  navSeparator,
  defaultMenuConfig,
  defaultMenuItemRecord,
  indexRightMenuGlobalKey,
  indexRightMenuProvideKey,
  rightMenuPrivateKey,
};
export type { WithDefaultMenuRecord };
