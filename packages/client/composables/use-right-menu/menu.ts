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
    rightMenuLogger.error("`defineDynamicMenu` can not use in mode 'manual'"); // why never don't work?
  } else {
    const dyn = createMenuContext(record);
    const ins = getCurrentInstance();

    if (!ins) rightMenuLogger.error("`defineDynamicMenu` must be used in setup script");

    onMounted(() => {
      const el = ins.proxy?.$el;
      if (!(el instanceof HTMLElement)) {
        rightMenuLogger.error("`defineDynamicMenu` require element to bound");
      }

      const handler = () => {
        ctx.dynamic.enable(ins);
      };

      ctx.dynamic.set(ins, dyn);
      el.addEventListener("contextmenu", handler, { capture: true });

      onUnmounted(() => {
        ctx.dynamic.remove(ins);
        el.removeEventListener("contextmenu", handler, { capture: true });
      });
    });
  }
}

export type { IndexMenuCustomRecords };
export { useIndexRightMenu, defineDynamicMenu };
