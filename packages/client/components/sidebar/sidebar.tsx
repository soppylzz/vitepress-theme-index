import type { Component } from "vue";
import { createVNode, defineComponent } from "vue";
import { useIndex, useMaybeI18nDataWithRoute } from "../../composables";
import type { SidebarItemConfig, SidebarItemType } from "../../types";
import { VtiSidebarButton, VtiSidebarGroup } from "./items";
import { hasOwnProperty } from "@vitepress-theme-index/shared";
import { isEmpty, omit } from "lodash-unified";

const sidebarItemMap: Record<SidebarItemType, Component> = {
  button: VtiSidebarButton,
  group: VtiSidebarGroup,
};

function renderSidebar(items: SidebarItemConfig[]) {
  return items.map((item) => {
    const { type, ...res } = item;
    const comp = sidebarItemMap[type];

    if (hasOwnProperty(item, "children") && !isEmpty(item?.children)) {
      const cleanProps = omit(res, "children");
      return createVNode(comp, { ...cleanProps }, () =>
        renderSidebar(item.children as SidebarItemConfig[])
      );
    }
    return createVNode(comp, { ...res });
  });
}

const VtiSidebar = defineComponent({
  name: "VtiSidebar",
  setup() {
    const {
      sidebar,
      theme: { response },
    } = useIndex();
    const items = useMaybeI18nDataWithRoute(sidebar, {});

    return () => (
      <div>
        {Object.entries(items.value).flatMap(([_key, groupItems]) => renderSidebar(groupItems))}
      </div>
    );
  },
});

export { VtiSidebar };
