import type { MenuItemConfig, MenuItemType } from "../../types";
import type { Component } from "vue";
import { createVNode } from "vue";
import { omit } from "lodash-unified";
import { hasOwnProperty } from "@vitepress-theme-index/shared";

import { default as VtiMenuButton } from "./button.vue";
import { default as VtiMenuGroup } from "./group.vue";
import { default as VtiMenuDivider } from "./divider.vue";
import { default as VtiMenu } from "./menu.vue";

const menuItemMap: Record<MenuItemType, Component> = {
  divider: VtiMenuDivider,
  button: VtiMenuButton,
  group: VtiMenuGroup,
};

function renderMenuItems(items: MenuItemConfig[], prefix: string) {
  return (items ?? []).map((item, index) => {
    const key = `${prefix}-${index}`;
    const { type, ...res } = item;

    const comp = menuItemMap[type];
    const cleanProps = omit(res, "children");
    if (hasOwnProperty(res, "children")) {
      return createVNode(comp, { key, ...cleanProps }, () =>
        renderMenuItems((res.children ?? []) as MenuItemConfig[], key)
      );
    }
    return createVNode(comp, { key, ...cleanProps });
  });
}

export { renderMenuItems, VtiMenuButton, VtiMenuGroup, VtiMenuDivider, VtiMenu };
