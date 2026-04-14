import { getCurrentInstance, inject, onMounted, onUnmounted } from "vue";
import type {
  IndexMenuContextConfig,
  IndexMenuGlobalContext,
  RMenuItemRecord,
  MenuMode,
} from "../../types";

import { indexRightMenuGlobalKey } from "../../types";
import { createMenuContext } from "../../utils";
import { rightMenuLogger } from "@vitepress-theme-index/shared";

type IndexMenuCustomRecords = never;

function useIndexRightMenu<
  Mode extends MenuMode,
  Record extends RMenuItemRecord = IndexMenuCustomRecords,
>() {
  const ctx = inject(indexRightMenuGlobalKey)!;
  return ctx as IndexMenuGlobalContext<Record, Mode>;
}

function defineDynamicMenu<Records extends RMenuItemRecord>(
  record: Partial<IndexMenuContextConfig<Records>>
) {
  const ctx = useIndexRightMenu();
  if (ctx.mode === "manual") {
    rightMenuLogger.error("`defineDynamicMenu` can not use in mode 'manual'");
    return; // why never dont work?
  }

  const dyn = createMenuContext(record);
  const ins = getCurrentInstance();

  if (!ins) {
    rightMenuLogger.error("`defineDynamicMenu` must be used in setup script");
    return;
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
      rightMenuLogger.error("`defineDynamicMenu` require element to bound");
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
