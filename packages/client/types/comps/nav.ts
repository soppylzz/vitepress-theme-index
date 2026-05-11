import type { IndexActivateEvent, IndexResponse, IndexIcon, IndexLink, IndexText } from "../global";
import type { Component } from "vue";
import type { PopperProps } from "./popper";
import type { MenuItemConfig } from "./menu";
import type { MaybeArray } from "@vitepress-theme-index/shared";

type NavContainer = "header" | "screen";

type NavItemShow = true | MaybeArray<IndexResponse>;
type NavButtonProps = {
  text?: IndexText;
  icon?: IndexIcon;
  baseUrl?: string;
  container?: NavContainer;
} & IndexLink &
  Omit<PopperProps, "placement" | "size" | "mode" | "activateEvent" | "autoPlace">;

interface NavMenuProps {
  text?: IndexText;
  icon?: IndexIcon;
  container?: NavContainer;
  activateEvent?: IndexActivateEvent;
}

type BuildNavConfig<T extends NavItemType, Props = never> = ([Props] extends [never]
  ? {}
  : Omit<Props, "container">) & { type: T } & (
    | { target: "screen" }
    | { target?: "header" | "both"; show?: NavItemShow }
  );

type NavSpaceConfig = BuildNavConfig<"space">;
type NavDividerConfig = BuildNavConfig<"divider">;
type NavLocaleConfig = BuildNavConfig<"locale">;
type NavSearchConfig = BuildNavConfig<"search">;
type NavButtonConfig = BuildNavConfig<"button", NavButtonProps> & { onActivate?: () => void };
type NavMenuConfig = BuildNavConfig<"menu", NavMenuProps> & { children?: MenuItemConfig[] };

type NavCustomConfig = BuildNavConfig<"custom"> & { component: Component };

type NavItemConfig =
  | NavMenuConfig
  | NavSpaceConfig
  | NavDividerConfig
  | NavButtonConfig
  | NavCustomConfig
  | NavLocaleConfig
  | NavSearchConfig;
type NavItemType = NavItemConfig["type"];

export type {
  NavItemType,
  NavContainer,
  NavButtonProps,
  NavMenuProps,
  NavItemConfig,
  NavCustomConfig,
  NavMenuConfig,
};
