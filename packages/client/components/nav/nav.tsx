import type { Component, VNode } from "vue";
import { watchEffect, ref, createVNode, defineComponent, vShow, withDirectives } from "vue";
import { useBem, useIndex, useViewItems } from "../../composables";
import { isBoolean, isUndefined, omit } from "lodash-unified";
import type {
  IndexResponse,
  NavCustomConfig,
  NavItemConfig,
  NavItemType,
  NavMenuConfig,
} from "../../types";
import { VtiNavBrand, VtiNavButton, VtiNavMenu, VtiNavTheme } from "./items";
import { ensureArray, hasOwnProperty } from "@vitepress-theme-index/shared";
import { renderMenuItems } from "../menu";

const ns = useBem("nav");
const _bems = {
  divider: useBem("nav-divider"),
  space: useBem("nav-space"),
};

const navItemMap: Record<NavItemType, Component | undefined> = {
  brand: VtiNavBrand,
  button: VtiNavButton,
  menu: VtiNavMenu,
  theme: VtiNavTheme,
  divider: undefined,
  space: undefined,
  custom: undefined,
};

interface NavItemRenderContext {
  container: "header" | "screen";
  current: IndexResponse;
}

function renderNavItem(
  key: number | string,
  config: NavItemConfig,
  ctx: NavItemRenderContext
): VNode | null {
  const { container, current } = ctx;
  const target = config?.target || "header";

  if (container !== target && target !== "both") return null;

  let visible = true;
  if (container === "header") {
    if (target === "both" && current === "mobile") {
      visible = false; // both-target mode has auto change process
    } else if (hasOwnProperty(config, "show") && !isUndefined(config?.show)) {
      const show = config?.show ?? true;
      visible = isBoolean(show) ? show : ensureArray(show).includes(current);
    }
  }

  let vnode: VNode | null = null;
  const { type, target: _tgt, ...res } = config;
  if (type === "custom") {
    vnode = createVNode((config as NavCustomConfig).component, { key, container });
  } else if (type === "space" || type === "divider") {
    const classes = [_bems[type].b(), _bems[type].m(container)];
    vnode = createVNode("div", { key, class: classes, container });
  } else {
    const comp = navItemMap[type];
    if (!comp) throw new Error(`unknown nav item type: ${type}`);

    const cleanProps = omit(res, ["children", "show"]);
    if (type === "menu") {
      vnode = createVNode(comp, { key, ...cleanProps, container }, () =>
        renderMenuItems((config as NavMenuConfig)?.children, "vti-nav")
      );
    } else {
      vnode = createVNode(comp, { key, ...cleanProps, container });
    }
  }
  if (!vnode) return null;

  if (container === "screen") return vnode;
  return withDirectives(vnode, [[vShow, visible]]);
}

// TODO: add slots transmit later
const VtiNav = defineComponent({
  name: "VtiNav",
  setup() {
    const {
      nav,
      theme: { response },
    } = useIndex();
    const items = useViewItems(nav, []);
    const open = ref(true);

    let originalOverflow = "";
    watchEffect((onCleanup) => {
      if (open.value && response.value === "mobile") {
        originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = originalOverflow || "";
      }
      onCleanup(() => {
        document.body.style.overflow = originalOverflow || "";
      });
    });

    return () => {
      const current = response.value;
      const kls = {
        wrapper: [ns.b(), ns.m(current)],
        header: [ns.e("header")],
        screen: [ns.e("screen"), ns.when("opened", open.value)],
      };

      return (
        <div class={kls.wrapper}>
          <div class={kls.header}>
            {
              /* main container */
              items.value.map((item, index) =>
                renderNavItem(index, item, { current, container: "header" })
              )
            }
          </div>
          {withDirectives(
            <div class={kls.screen}>
              {
                /* screen container */
                items.value.map((item, index) =>
                  renderNavItem(index, item, { current, container: "screen" })
                )
              }
            </div>,
            [[vShow, response.value === "mobile"]]
          )}
        </div>
      );
    };
  },
});

export { VtiNav };
