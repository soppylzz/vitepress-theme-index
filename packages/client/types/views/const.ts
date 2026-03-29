import type { InjectionKey } from "vue";
import { inject } from "vue";
import type { IndexNavConfig } from "./nav";
import type { IndexSidebarConfig } from "./sidebar";

type ViewGroupContext = { level: number };

const viewGroupKey: InjectionKey<ViewGroupContext> = Symbol("viewGroupContext");
const indexNavKey: InjectionKey<IndexNavConfig> = Symbol("indexNavContentKey");
const indexSidebarKey: InjectionKey<IndexSidebarConfig> = Symbol("indexSidebarKey");

export { viewGroupKey, indexNavKey, indexSidebarKey };
