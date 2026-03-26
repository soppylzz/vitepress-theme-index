import type { InjectionKey } from "vue";
import type { IndexNavConfig } from "./nav";
import type { IndexSidebarConfig } from "./sidebar";

interface viewGroupContext {
  level: number;
}

const viewGroupKey: InjectionKey<viewGroupContext> = Symbol("viewGroupContext");

const indexNavKey: InjectionKey<IndexNavConfig> = Symbol("indexNavContentKey");
const indexSidebarKey: InjectionKey<IndexSidebarConfig> = Symbol("indexSidebarKey");

export { viewGroupKey, indexNavKey };
export type { viewGroupContext };
