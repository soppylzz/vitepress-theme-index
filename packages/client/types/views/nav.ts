import type { IndexActivateEvent, IndexResponse, IndexIcon, IndexLink, IndexText } from "../global";
import type { Component } from "vue";
import type { BuildI18nViewConfig } from "../i18n";
import type { MenuItemConfig, PopperProps } from "../comps";
import type { MaybeArray } from "@vitepress-theme-index/shared";

type NavContainer = "header" | "screen";

type NavItemShow = true | MaybeArray<IndexResponse>;
interface NavBrandProps extends IndexLink {
  text: IndexText;
  brand?: string;
  container?: NavContainer;
}

type NavButtonProps = {
  text?: IndexText;
  icon?: IndexIcon;
  container?: NavContainer;
} & IndexLink &
  Omit<PopperProps, "placement" | "size" | "mode" | "activateEvent" | "autoPlace">;

interface NavThemeProps {
  carousel?: "column" | "row";
  container?: NavContainer;
}

interface NavMenuProps {
  text: IndexText;
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
type NavBrandConfig = BuildNavConfig<"brand", NavBrandProps>;
type NavButtonConfig = BuildNavConfig<"button", NavButtonProps> & { onActivate?: () => void };
type NavMenuConfig = BuildNavConfig<"menu", NavMenuProps> & { children?: MenuItemConfig[] };

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
  | NavThemeConfig;
type NavItemType = NavItemConfig["type"];

type IndexNavConfig = BuildI18nViewConfig<NavItemConfig[]>;

export type {
  NavItemType,
  // props
  NavBrandProps,
  NavButtonProps,
  NavMenuProps,
  NavThemeProps,
  // config
  IndexNavConfig,
  NavItemConfig,
  NavCustomConfig,
  NavMenuConfig,
};
