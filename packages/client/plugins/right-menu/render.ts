import type { App, VNode } from "vue";
import { computed, createVNode, reactive, render, watchEffect } from "vue";
import type { IndexMenuContextConfig, MenuTrigger } from "../../types";
import { VtiRMenuTree } from "../../components";

let isRenderInstall = false;
let globalRightMenu: VNode | null = null;
let globalContainer: HTMLElement | null = null;

function renderRightMenuTree(
  app: App,
  props: {
    trigger: MenuTrigger;
    ctx: IndexMenuContextConfig;
  },
  options?: {
    destroyOnClose?: boolean;
    onClose?: () => void;
    onDestroy?: () => void;
  }
): { close: () => void } {
  if (import.meta.env.SSR) return { close() {} };

  const { destroyOnClose = false, onDestroy = () => {}, onClose = () => {} } = options ?? {};
  const treeProps = reactive({
    show: false,
    trigger: props.trigger,
    coords: [0, 0],
    ctx: computed(() => props.ctx.record),
  });

  function create(e: MouseEvent) {
    e.preventDefault();
    treeProps.coords = [e.clientX, e.clientY];

    if (!globalContainer) {
      const container = document.createElement("div");
      container.className = "right-menu-container";
      document.body.appendChild(container);
      globalContainer = container;
    }
    if (!globalRightMenu) {
      watchEffect(() => {
        globalRightMenu = createVNode(VtiRMenuTree, treeProps);
        globalRightMenu.appContext = app._context;
        render(globalRightMenu, globalContainer!);
      });
    }
    globalContainer.style.display = "block";
    treeProps.show = true;
  }
  function close() {
    treeProps.show = false;
    onClose();
    if (destroyOnClose) {
      destroy();
    } else {
      if (globalContainer) {
        globalContainer.style.display = "none";
      }
    }
  }
  function destroy() {
    onDestroy();
    if (globalContainer && globalRightMenu) {
      render(null, globalContainer);
      globalRightMenu = null;
    }
    if (globalContainer && globalContainer.parentNode) {
      globalContainer.parentNode.removeChild(globalContainer);
      globalContainer = null;
    }
  }

  if (!isRenderInstall) {
    isRenderInstall = true;
    window.addEventListener("contextmenu", create);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close);

    app.onUnmount(() => {
      window.removeEventListener("contextmenu", create);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close);
    });
  }

  return { close };
}

export { renderRightMenuTree };
