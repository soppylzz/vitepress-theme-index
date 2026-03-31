import type { InjectionKey } from "vue";
import { inject } from "vue";
import type { IndexNavConfig } from "./nav";
import type { IndexSidebarConfig } from "./sidebar";

const indexNavKey: InjectionKey<IndexNavConfig> = Symbol("indexNavContentKey");
const indexSidebarKey: InjectionKey<IndexSidebarConfig> = Symbol("indexSidebarKey");

export { indexNavKey, indexSidebarKey };
