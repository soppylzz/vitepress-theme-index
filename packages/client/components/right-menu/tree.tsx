import type { PropType, Component } from "vue";
import { createVNode, defineComponent } from "vue";
import type { RMenuItemRecord, RMenuItemType } from "../../types";
import { VtiRightMenu, rightMenuProps } from "./menu";
import {
  VtiRMenuDivider,
  VtiRMenuGroup,
  VtiRMenuIcon,
  VtiRMenuSubMenu,
  VtiRMenuText,
} from "./items";
import { hasOwnProperty } from "@vitepress-theme-index/shared";
import { omit } from "lodash-unified";

const rightMenuItemMap: Record<RMenuItemType, Component | undefined> = {
  "sub-menu": VtiRMenuSubMenu,
  divider: VtiRMenuDivider,
  group: VtiRMenuGroup,
  icon: VtiRMenuIcon,
  text: VtiRMenuText,
  custom: undefined,
};

function renderRightMenu(records?: RMenuItemRecord) {
  return Object.entries(records ?? {}).map(([key, ctx]) => {
    const { type, hooks, ...res } = ctx;
    if (ctx.type === "custom") {
      return createVNode(ctx.component, { key });
    }

    const comp = rightMenuItemMap[type];
    if (!comp) throw new Error(`unknown menu item type: ${type}`);

    const cleanProps = omit(res, "children");
    if (hasOwnProperty(res, "children")) {
      return createVNode(comp, { key, ...cleanProps, ...hooks }, () =>
        renderRightMenu((res?.children ?? {}) as RMenuItemRecord)
      );
    }
    return createVNode(comp, { key, ...cleanProps, ...hooks });
  });
}

const VtiRMenuTree = defineComponent({
  name: "VtiRMenuTree",
  props: {
    ctx: {
      type: Object as PropType<RMenuItemRecord>,
      default: () => ({}),
    },
    ...rightMenuProps,
  },
  setup(props) {
    return () => {
      const { ctx = {}, ...menu } = props;
      return <VtiRightMenu {...menu}>{{ default: () => renderRightMenu(ctx) }}</VtiRightMenu>;
    };
  },
});

export { VtiRMenuTree };
