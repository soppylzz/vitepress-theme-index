import type { IndexLink, IndexText, IndexIcon } from "../global";

interface SidebarButton {
  text: IndexText;
  icon?: IndexIcon;
}

interface SidebarGroup {
  text: IndexText;
  icon?: IndexIcon;
  collapsed?: true;
}

type SidebarButtonConfig = { type: "button" } & IndexLink & SidebarButton;
type SidebarGroupConfig = { type: "group"; children?: SidebarItemConfig[] } & SidebarGroup;

type SidebarItemConfig = SidebarButtonConfig | SidebarGroupConfig;

type IndexSidebarConfig = { items: SidebarItemConfig[] | Record<string, SidebarItemConfig[]> };

export type { IndexSidebarConfig };
