import type { IndexIcon, IndexLink, IndexSize, IndexText } from "../global";

interface MenuProps {
  size?: IndexSize;
  showActivate?: boolean;
}

type MenuButtonProps = { text: IndexText; icon?: IndexIcon } & IndexLink;
type MenuGroupProps = { text: IndexText; collapsed?: boolean };

type MenuButtonConfig = { type: "button"; onActivate?: () => void } & MenuButtonProps;
type MenuGroupConfig = { type: "group"; children?: MenuItemConfig[] } & MenuGroupProps;
type MenuDividerConfig = { type: "divider" };

type MenuItemConfig = MenuButtonConfig | MenuGroupConfig | MenuDividerConfig;
type MenuItemType = MenuItemConfig["type"];

export type { MenuItemType, MenuItemConfig, MenuProps, MenuButtonProps, MenuGroupProps };
