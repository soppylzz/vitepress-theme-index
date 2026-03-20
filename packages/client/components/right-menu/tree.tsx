import type { PropType, Component } from "vue";
import { createVNode, defineComponent } from "vue";
import type { MenuItemRecord, MenuItemType } from "../../types";
import { RightMenu, rightMenuProps } from "./menu";
import {
  VtiRMenuDivider,
  VtiRMenuGroup,
  VtiRMenuIcon,
  VtiRMenuSubMenu,
  VtiRMenuText,
} from "./items";
import { hasOwnProperty } from "@vitepress-theme-index/shared";

const rightMenuItemMap: Record<MenuItemType, Component | undefined> = {
  "sub-menu": VtiRMenuSubMenu,
  divider: VtiRMenuDivider,
  group: VtiRMenuGroup,
  icon: VtiRMenuIcon,
  text: VtiRMenuText,
  custom: undefined,
};

function renderRightMenu(records?: MenuItemRecord) {
  return Object.entries(records ?? {}).map(([key, ctx]) => {
    const { type, hooks, ...props } = ctx;
    if (ctx.type === "custom") {
      return createVNode(ctx.component, { key });
    }

    const comp = rightMenuItemMap[type];
    if (!comp) {
      throw new Error(`unknown menu item type: ${type}`);
    }

    if (hasOwnProperty(props, "children")) {
      const { children = {}, ...res } = props;
      return createVNode(comp, { key, ...res, ...hooks }, () =>
        renderRightMenu(children as MenuItemRecord)
      );
    }
    return createVNode(comp, { key, ...props, ...hooks });
  });
}

const VtiRMenuTree = defineComponent({
  name: "VtiRMenuTree",
  props: {
    ctx: {
      type: Object as PropType<MenuItemRecord>,
      default: () => ({}),
    },
    ...rightMenuProps,
  },
  setup(props) {
    return () => {
      const { ctx = {}, ...menu } = props;
      return <RightMenu {...menu}>{{ default: () => renderRightMenu(ctx) }}</RightMenu>;
    };
  },
});

export { VtiRMenuTree };
