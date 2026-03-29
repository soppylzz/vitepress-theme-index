import type { MaybeArray } from "@vitepress-theme-index/shared";

const menuItemAligns = ["start", "center", "end"] as const;
const menuItemStates = ["enabled", "disabled"] as const;

type MenuItemAlign = (typeof menuItemAligns)[number];
type MenuItemState = (typeof menuItemStates)[number];

const menuMode = ["manual", "auto", "mixed"] as const;
const menuSize = ["small", "medium", "large"] as const;
const menuMergeOrder = ["static-first", "dynamic-first"] as const;
const menuMountMode = ["keep-alive", "on-demand"] as const;
const menuMergeMode = ["override", "attach"] as const;

type MenuMode = (typeof menuMode)[number];
type MenuSize = (typeof menuSize)[number];
type MenuMergeOrder = (typeof menuMergeOrder)[number];
type MenuMountMode = (typeof menuMountMode)[number];
type MenuMergeMode = (typeof menuMergeMode)[number];

type HTMLElementTagName = keyof HTMLElementTagNameMap;
type MenuTrigger = boolean | MaybeArray<HTMLElementTagName>;

const menuItemNavState = ["unselect", "selected"] as const;
type MenuItemNavState = (typeof menuItemNavState)[number];

export type {
  MenuItemAlign,
  MenuItemState,
  MenuTrigger,
  MenuSize,
  MenuMode,
  MenuMergeOrder,
  MenuMountMode,
  MenuMergeMode,
  MenuItemNavState,
};
