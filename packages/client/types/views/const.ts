import type { InjectionKey } from "vue";
import type { IndexNavConfig } from "./nav";
import type { IndexSidebarConfig } from "./sidebar";
import type { IndexSiteConfig } from "../theme-index";

const indexSiteKey: InjectionKey<IndexSiteConfig> = Symbol("indexSiteKey");
const indexNavKey: InjectionKey<IndexNavConfig> = Symbol("indexNavContentKey");
const indexSidebarKey: InjectionKey<IndexSidebarConfig> = Symbol("indexSidebarKey");

export { indexNavKey, indexSidebarKey, indexSiteKey };
