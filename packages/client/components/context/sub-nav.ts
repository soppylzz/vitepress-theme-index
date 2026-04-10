import type { InjectionKey } from "vue";
import { inject, provide, readonly, ref } from "vue";

interface SubNavContext {
  closeToc(): void;
}

const subNavKey: InjectionKey<SubNavContext> = Symbol("subNavKey");

function provideSubNavContext() {
  const isExpand = ref(false);
  function toggleToc() {
    isExpand.value = !isExpand.value;
  }
  function closeToc() {
    console.log("close");
    isExpand.value = false;
  }

  provide(subNavKey, { closeToc });
  return { isExpand: readonly(isExpand), toggleToc, closeToc };
}

function useSubNav() {
  return inject(subNavKey, null);
}

export { useSubNav, provideSubNavContext };
