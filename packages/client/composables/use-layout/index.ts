import { useData } from "vitepress";
import { computed } from "vue";

/* Inspired by Vitepress defaultTheme */
function useLayout() {
  const { frontmatter } = useData();
  const isHome = computed(
    () => !!(frontmatter.value.isHome ?? frontmatter.value.layout === "home")
  );
  return { isHome };
}

export { useLayout };
