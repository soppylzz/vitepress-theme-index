import { computed, onMounted, readonly, ref } from "vue";
import type { IndexOS } from "../../types";

let isInited = false;
const os = ref<IndexOS>("unknown");

function useOS() {
  onMounted(() => {
    if (isInited) return;
    const ua = navigator.userAgent.toLowerCase();
    os.value = (ua.match(/mac|linux|win/)?.[0] || "unknown") as IndexOS;
    isInited = true;
  });

  const metaKey = computed(
    () =>
      ({
        mac: "⌘",
        linux: "❖",
        win: "⊞",
        unknown: "⊞",
      })[os.value]
  );

  return {
    os: readonly(os),
    metaKey,
  };
}

export { useOS };
