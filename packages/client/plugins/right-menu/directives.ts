import type { App, Directive } from "vue";
import type { IndexMenuContextConfig, MenuDynamicContext, CachedComputedRef } from "../../types";
import { createMenuContext } from "../../utils";

declare global {
  interface HTMLElement {
    __indexMenuHandler?: ((e: MouseEvent) => void) | null;
  }
}

function createDirective(
  dynamic: CachedComputedRef<HTMLElement, MenuDynamicContext>
): Directive<HTMLElement, Partial<IndexMenuContextConfig>> {
  return {
    mounted(el, binding) {
      const config = binding.value;
      if (!config) {
        return;
      }

      const ctx = createMenuContext(config);
      dynamic.set(el, ctx);

      el.__indexMenuHandler = () => {
        dynamic.enable(el);
      };
      el.addEventListener("contextmenu", el.__indexMenuHandler, { capture: true });
    },
    unmounted(el) {
      dynamic.remove(el);
      const handler = el.__indexMenuHandler;
      if (handler) {
        el.removeEventListener("contextmenu", handler, { capture: true });
        el.__indexMenuHandler = null;
      }
    },
  };
}

function installDynamicMenuDirective(
  app: App,
  dynamic: CachedComputedRef<HTMLElement, MenuDynamicContext>
) {
  app.directive("v-dynamic-menu", createDirective(dynamic));
}

export { installDynamicMenuDirective };
