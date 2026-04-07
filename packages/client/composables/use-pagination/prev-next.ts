import type { MenuItemConfig, MenuLinkItem } from "../../types";
import { checkExternal, normalizeLink } from "../../utils";
import { useData, useRoute } from "vitepress";
import { computed } from "vue";
import { flatArrayWithRoute, useIndex, useMaybeI18nDataWithRoute } from "../use-index";

function getValidInternalItems(items: MenuItemConfig[]): MenuLinkItem[] {
  const list: MenuLinkItem[] = [];
  function traverse(item: MenuItemConfig) {
    if (item.type === "button") {
      const isValid = item.href && !checkExternal(item.href) && item._target !== "_blank";
      if (isValid) list.push(item);
      return;
    }
    if (item.type === "group" && item?.children.length) {
      item.children.forEach(traverse);
    }
  }
  items.forEach(traverse);
  return list;
}

function usePrevNext() {
  const { site } = useData();
  const route = useRoute();

  const { sidebar } = useIndex();
  const rawSidebar = useMaybeI18nDataWithRoute(sidebar, {});

  const items = computed(() => {
    const items = flatArrayWithRoute(rawSidebar.value);
    return getValidInternalItems(items);
  });

  const currentIndex = computed(() =>
    items.value.findIndex((item) => normalizeLink(site.value, item.href) === route.path)
  );

  const prev = computed(() =>
    currentIndex.value > 0 ? items.value[currentIndex.value - 1] : null
  );
  const next = computed(() => {
    const idx = currentIndex.value;
    console.log(currentIndex.value);
    console.log(items.value.length);
    return idx !== -1 && idx < items.value.length - 1 ? items.value[idx + 1] : null;
  });
  return { prev, next };
}

export { usePrevNext };
