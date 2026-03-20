import type { IndexLink, IndexText, IndexIcon } from "../global";

interface SidebarTextConfig extends IndexLink {
  type: "item";
  text: IndexText;
  icon?: IndexIcon;
}

interface SidebarGroupConfig {
  type: "group";
  text: IndexText;
  icon?: IndexIcon;
  closeable?: true;
  children?: SidebarItemConfig[];
}

type SidebarItemConfig = SidebarTextConfig | SidebarGroupConfig;

type IndexSidebarConfig =
  | { i18nInfer?: true; ctx: SidebarItemConfig[] }
  | { i18nInfer: false; ctx: Record<string, SidebarItemConfig[]> };

export type { IndexSidebarConfig };
