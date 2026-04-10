import { useData } from "vitepress";
import { computed } from "vue";

function useLayout() {
  const { page } = useData();

  const hasToc = computed(() => page.value.headers.length > 0);
  return { hasToc };
}

export { useLayout };
