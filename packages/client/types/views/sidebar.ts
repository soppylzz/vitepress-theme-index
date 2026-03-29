import type { IndexLink, IndexText, IndexIcon } from "../global";
import type { BuildI18nViewConfig } from "../i18n";

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
type SidebarItemType = SidebarItemConfig["type"];

type SidebarItemConfig = SidebarButtonConfig | SidebarGroupConfig;
type IndexSidebarConfig = BuildI18nViewConfig<Record<string, SidebarItemConfig[]>>;

export type { SidebarButton, SidebarGroup, SidebarItemType, SidebarItemConfig, IndexSidebarConfig };
