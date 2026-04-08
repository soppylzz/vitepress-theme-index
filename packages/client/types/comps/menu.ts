import type { IndexIcon, IndexLink, IndexSize, IndexText, IndexTextLink } from "../global";

interface MenuProps {
  size?: IndexSize;
  collapsed?: boolean;
  showActivate?: boolean;
}

type MenuButtonProps = { icon?: IndexIcon } & IndexTextLink;
type MenuGroupProps = { text: IndexText; collapsable?: boolean };

type MenuButtonConfig = { type: "button"; onActivate?: () => void } & MenuButtonProps;
type MenuGroupConfig = { type: "group"; children?: MenuItemConfig[] } & MenuGroupProps;
type MenuDividerConfig = { type: "divider" };

type MenuItemConfig = MenuButtonConfig | MenuGroupConfig | MenuDividerConfig;
type MenuItemType = MenuItemConfig["type"];

type MenuLinkItem = Extract<MenuItemConfig, IndexLink>;

export type {
  MenuItemType,
  MenuItemConfig,
  MenuProps,
  MenuButtonProps,
  MenuGroupProps,
  MenuLinkItem,
};
