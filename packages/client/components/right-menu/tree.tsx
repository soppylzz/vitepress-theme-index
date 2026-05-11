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
import { hasOwnProperty, pascalCase, renderLogger } from "@vitepress-theme-index/shared";
import { isObject, omit } from "lodash-unified";

const rightMenuItemMap: Record<RMenuItemType, Component | undefined> = {
  "sub-menu": VtiRMenuSubMenu,
  divider: VtiRMenuDivider,
  group: VtiRMenuGroup,
  icon: VtiRMenuIcon,
  text: VtiRMenuText,
  custom: undefined,
};

function toOnHooks<T extends Record<string, any>>(hooks?: T) {
  return isObject(hooks)
    ? Object.fromEntries(Object.entries(hooks).map(([key, hook]) => [`on${pascalCase(key)}`, hook]))
    : {};
}

function renderRightMenu(records?: RMenuItemRecord) {
  return Object.entries(records ?? {}).map(([key, ctx]) => {
    const { type, hooks, ...res } = ctx;
    if (ctx.type === "custom") {
      return createVNode(ctx.component, { key });
    }

    const comp = rightMenuItemMap[type];
    if (!comp) {
      renderLogger.error(`unknown menu item type: ${type}`);
      return;
    }

    const cleanProps = omit(res, "children");
    if (hasOwnProperty(res, "children")) {
      return createVNode(comp, { key, ...cleanProps, ...toOnHooks(hooks) }, () =>
        renderRightMenu((res?.children ?? {}) as RMenuItemRecord)
      );
    }
    return createVNode(comp, { key, ...cleanProps, ...toOnHooks(hooks) });
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
