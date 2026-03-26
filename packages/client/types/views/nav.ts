import type {
  IndexActivateEvent,
  IndexResponse,
  IndexIcon,
  IndexLink,
  IndexText,
  IndexPlacement,
} from "../global";
import type { Component } from "vue";
import type { MaybeArray } from "@vitepress-theme-index/shared";

type NavItemShow = true | MaybeArray<IndexResponse>;
type NavItemType = "brand" | "menu" | "button" | "theme" | "divider" | "space" | "custom";
type NavMenuItemType = "group" | "button";

interface NavBrandProps extends IndexLink {
  text: IndexText;
  brand?: string;
}

type NavButtonIconProps = {
  icon: IndexIcon;
  tooltip?: IndexText;
  placement?: Exclude<IndexPlacement, "top">;
} & IndexLink;
type NavButtonTextProps = { text: IndexText; icon?: IndexIcon } & IndexLink;
type NavButtonProps = NavButtonIconProps | NavButtonTextProps;

interface NavThemeProps {
  carousel?: "column" | "row";
  direction?: "reverse" | "in-order";
}

interface NavMenuProps {
  text: IndexText;
  icon?: IndexIcon;
  activateEvent?: IndexActivateEvent;
}

type NavMenuTextProps = IndexLink & { text: IndexText; icon?: IndexIcon };
type NavMenuGroupProps = { text: IndexText; closeable?: boolean };

type NavMenuTextConfig = NavMenuTextProps & { type: "button" };
type NavMenuGroupConfig = NavMenuGroupProps & {
  type: "group";
  children?: NavMenuItemConfig[];
};
type NavMenuItemConfig = NavMenuTextConfig | NavMenuGroupConfig;

type BuildNavConfig<T extends NavItemType, Props = never> = ([Props] extends [never]
  ? {}
  : Props) & { type: T } & (
    | { target: "screen" }
    | { target?: "header" | "both"; show?: NavItemShow }
  );

type NavSpaceConfig = BuildNavConfig<"space">;
type NavDividerConfig = BuildNavConfig<"divider">;
type NavBrandConfig = BuildNavConfig<"brand", NavBrandProps>;
type NavButtonConfig = BuildNavConfig<"button", NavButtonProps> & { onActivate?: () => void };
type NavMenuConfig = BuildNavConfig<"menu", NavMenuProps> & { children?: NavMenuItemConfig[] };
type NavCustomConfig = BuildNavConfig<"custom"> & { component: Component };
type NavThemeConfig = BuildNavConfig<"theme", NavThemeProps>;

type NavItemConfig =
  | NavMenuConfig
  | NavSpaceConfig
  | NavDividerConfig
  // real item config
  | NavBrandConfig
  | NavButtonConfig
  | NavCustomConfig
  | NavThemeConfig; // TODO: wait to realize

type IndexNavConfig = { items: NavItemConfig[] | Record<string, NavItemConfig[]> };

export type {
  NavItemType,
  NavMenuItemType,
  // sub-props
  NavButtonIconProps,
  NavButtonTextProps,
  NavMenuTextProps,
  NavMenuGroupProps,
  // props
  NavBrandProps,
  NavButtonProps,
  NavMenuProps,
  NavThemeProps,
  // config
  IndexNavConfig,
  NavItemConfig,
  NavMenuItemConfig,
  NavCustomConfig,
  NavMenuConfig,
};
