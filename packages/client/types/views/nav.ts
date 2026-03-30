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
import type { BuildI18nViewConfig } from "../i18n";
import type { TooltipProps } from "../comps/tooltip";

type NavItemShow = true | MaybeArray<IndexResponse>;
interface NavBrandProps extends IndexLink {
  text: IndexText;
  brand?: string;
}

type NavButtonProps = {
  text?: IndexText;
  icon?: IndexIcon;
  tooltip?: IndexText;
} & IndexLink &
  Omit<TooltipProps, "tooltip" | "placement" | "size">;

interface NavThemeProps {
  carousel?: "column" | "row";
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
type NavMenuItemType = NavMenuItemConfig["type"];

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
  | NavThemeConfig;
type NavItemType = NavItemConfig["type"];

type IndexNavConfig = BuildI18nViewConfig<NavItemConfig[]>;

export type {
  NavItemType,
  NavMenuItemType,
  // sub-props
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
