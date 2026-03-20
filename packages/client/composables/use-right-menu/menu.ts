import { getCurrentInstance, inject, onMounted, onUnmounted } from "vue";
import type {
  IndexMenuContextConfig,
  IndexMenuGlobalContext,
  MenuItemRecord,
  MenuMode,
} from "../../types";

import { indexRightMenuGlobalKey } from "../../types";
import { createMenuContext } from "../../utils";

type IndexMenuCustomRecords = never;

function useIndexRightMenu<
  Mode extends MenuMode,
  Record extends MenuItemRecord = IndexMenuCustomRecords,
>() {
  const ctx = inject(indexRightMenuGlobalKey);
  if (!ctx) throw new Error("IndexMenuGlobalContext not be provided");
  return ctx as IndexMenuGlobalContext<Record, Mode>;
}

function defineDynamicMenu<Records extends MenuItemRecord>(
  record: Partial<IndexMenuContextConfig<Records>>
) {
  const ctx = useIndexRightMenu();
  if (ctx.mode === "manual") {
    throw new Error("defineDynamicMenu can not use in mode manual");
  }

  const dyn = createMenuContext(record);
  const ins = getCurrentInstance();

  if (!ins) {
    throw new Error("defineDynamicMenu must be used in setup script");
  }

  let el: HTMLElement | null = null;
  const handler = () => {
    ctx.dynamic.enable(ins);
  };

  onMounted(() => {
    ctx.dynamic.set(ins, dyn);
    const raw = ins.proxy?.$el;
    if (raw instanceof HTMLElement) {
      el = raw;
      el.addEventListener("contextmenu", handler, { capture: true });
    } else {
      throw new Error("defineDynamicMenu require element to bound");
    }
  });
  onUnmounted(() => {
    if (el) {
      el.removeEventListener("contextmenu", handler, { capture: true });
    }
    ctx.dynamic.remove(ins);
  });
}

export type { IndexMenuCustomRecords };
export { useIndexRightMenu, defineDynamicMenu };
