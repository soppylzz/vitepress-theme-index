import { inject, readonly, ref } from "vue";
import { localLNavKey } from "../../types";

function provideLNavDocs() {
  const isExpand = ref(false);
  const closeToc = () => {
    isExpand.value = false;
  };
  const toggleToc = () => {
    isExpand.value = !isExpand.value;
  };
  return { closeToc, toggleToc, isExpand: readonly(isExpand) };
}

function useLNav() {
  return inject(localLNavKey, null);
}

export { provideLNavDocs, useLNav };
