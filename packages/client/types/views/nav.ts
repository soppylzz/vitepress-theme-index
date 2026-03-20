import type { IndexActivateEvent, IndexResponse, IndexIcon, IndexLink, IndexText } from "../global";
import type { Component } from "vue";
import type { HasSlots } from "../vue";

type NavItemShow = IndexResponse | "auto";
type NavItemType = "brand" | "menu" | "event" | "theme" | "divider" | "space" | "custom";

interface NavBrandProps extends IndexLink {
  text: IndexText;
  brand?: string;
}

type NavEventProps = (
  | { text: IndexText; icon?: IndexIcon }
  | { icon: IndexIcon; tooltip?: IndexText }
) &
  IndexLink;

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

type NavMenuTextConfig = NavMenuTextProps & { type: "menu-text" };
type NavMenuGroupConfig = NavMenuGroupProps & {
  type: "menu-group";
  children?: NavMenuItemConfig[];
};
type NavMenuItemConfig = NavMenuTextConfig | NavMenuGroupConfig;

type BuildNavConfig<T extends NavItemType, Props = never> = ([Props] extends [never]
  ? Record<string, never>
  : Props) & {
  type: T;
  show?: NavItemShow;
  match?: string;
};

type NavSpaceConfig = BuildNavConfig<"space">;
type NavDividerConfig = BuildNavConfig<"divider">;
type NavBrandConfig = BuildNavConfig<"brand", NavBrandProps> &
  HasSlots<"nav-brand-before" | "nav-brand" | "nav-brand-after">;
type NavThemeConfig = BuildNavConfig<"theme", NavThemeProps>;
type NavEventConfig = BuildNavConfig<"event", NavEventProps> & { onActivate?: () => void };
type NavMenuConfig = BuildNavConfig<"menu", NavMenuProps> & { children?: NavMenuItemConfig[] };
type NavCustomConfig = BuildNavConfig<"custom"> & { component: Component };

type NavItemConfig =
  | NavSpaceConfig
  | NavDividerConfig
  // real item config
  | NavBrandConfig
  | NavThemeConfig
  | NavEventConfig
  | NavMenuConfig
  | NavCustomConfig;

type IndexNavConfig =
  | { i18n: "vue-i18n"; items: NavItemConfig[] }
  | { i18n?: "vitepress"; items: Record<string, NavItemConfig> };

export type {
  // props
  NavBrandProps,
  NavThemeProps,
  // config
  IndexNavConfig,
};
