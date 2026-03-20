import type { ComponentCustomProperties, VNode } from "vue";

declare global {
  namespace JSX {
    type Element = VNode;
    type ElementClass = ComponentCustomProperties;
    interface IntrinsicElements {
      [elem: string]: unknown;
    }
  }
}

declare global {
  interface HTMLElement {
    __indexMenuHandler?: ((e: MouseEvent) => void) | null;
  }
}
