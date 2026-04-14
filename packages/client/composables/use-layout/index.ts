import { useData } from "vitepress";
import { computed } from "vue";
import { flatArrayWithRoute, useSidebar } from "../use-index";

function useLayout() {
  const { page } = useData();

  const raw = useSidebar();
  const sidebar = computed(() => flatArrayWithRoute(raw.value));
  const hasSidebar = computed(() => !!sidebar.value && sidebar.value.length > 0);
  const hasToc = computed(() => page.value.headers.length > 0);
  return { hasToc, hasSidebar };
}

export { useLayout };
