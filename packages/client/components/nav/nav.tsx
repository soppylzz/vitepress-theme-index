import type { Component, VNode } from "vue";
import { watchEffect, ref, createVNode, defineComponent, vShow, withDirectives } from "vue";
import { useBem, useIndex, useViewItems } from "../../composables";
import { isBoolean, isUndefined, omit } from "lodash-unified";
import type {
  IndexResponse,
  MenuItemConfig,
  NavCustomConfig,
  NavItemConfig,
  NavItemType,
} from "../../types";
import { VtiNavButton, VtiNavMenu, VtiNavSwitch, VtiNavTheme } from "./items";
import { ensureArray, hasOwnProperty } from "@vitepress-theme-index/shared";
import { renderMenuItems } from "../menu";
import { VtiBrand } from "../public";

const ns = useBem("nav");
const bems = {
  divider: useBem("nav-divider"),
  space: useBem("nav-space"),
};
const navItemMap: Record<NavItemType, Component | undefined> = {
  button: VtiNavButton,
  menu: VtiNavMenu,
  theme: VtiNavTheme,
  divider: undefined,
  space: undefined,
  custom: undefined,
};

type NavItemContainer = "header" | "screen";

interface NavItemRenderContext {
  current: IndexResponse;
  container: NavItemContainer;
}

function computeVisible(config: NavItemConfig, ctx: NavItemRenderContext) {
  const { container, current } = ctx;
  const target = config?.target || "header";

  if (container === "header") {
    if (target === "both" && current === "mobile") return false;
    if (hasOwnProperty(config, "show") && !isUndefined(config?.show)) {
      const show = config?.show ?? true;
      return isBoolean(show) ? show : ensureArray(show).includes(current);
    }
  }
  return true;
}

function checkRender(config: NavItemConfig, container: NavItemContainer) {
  const target = config?.target || "header";
  return target === container || target === "both";
}

function renderContentByType(
  key: number | string,
  config: NavItemConfig,
  ctx: NavItemRenderContext
): VNode | null {
  const { container } = ctx;
  const { type, ...res } = config;

  switch (type) {
    case "custom":
      return createVNode((config as NavCustomConfig).component, { key, container });
    case "divider":
    case "space": {
      const itemNs = bems[type];
      return createVNode("div", { key, class: [itemNs.b(), itemNs.m(container)], container });
    }
    default: {
      const comp = navItemMap[type];
      if (!comp) throw new Error(`unknown nav item type: ${type}`);
      const cleanProps = omit(res, ["children", "show"]);
      if (type === "menu") {
        return createVNode(comp, { key, ...cleanProps, container }, () =>
          renderMenuItems((config?.children ?? []) as MenuItemConfig[], "vti-nav")
        );
      }
      return createVNode(comp, { key, ...cleanProps, container });
    }
  }
}

function renderNavItem(
  key: number | string,
  config: NavItemConfig,
  ctx: NavItemRenderContext
): VNode | null {
  if (!checkRender(config, ctx.container)) return null;
  const vnode = renderContentByType(key, config, ctx);
  if (ctx.container === "screen") return vnode;

  const visible = computeVisible(config, ctx);
  return withDirectives(vnode, [[vShow, visible]]);
}

const VtiNav = defineComponent({
  name: "VtiNav",
  setup() {
    const {
      nav,
      site,
      theme: { response },
    } = useIndex();
    const items = useViewItems(nav, []);
    const siteRef = useViewItems(site, undefined);

    const open = ref(false);

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
            {<VtiBrand text={siteRef.value.siteName} brand={siteRef.value.brand} size={"medium"} />}
            {
              /* header container */
              items.value
                .map((item, index) => renderNavItem(index, item, { current, container: "header" }))
                .filter((item) => !!item)
            }
            {withDirectives(
              renderNavItem("pre-switch", { type: "divider" }, { current, container: "header" }),
              [[vShow, current === "mobile"]]
            )}
            {withDirectives(<VtiNavSwitch v-model={open.value} />, [[vShow, current === "mobile"]])}
          </div>
          {
            /* screen container */
            withDirectives(
              <div class={kls.screen}>
                {items.value
                  .map((item, index) =>
                    renderNavItem(index, item, { current, container: "screen" })
                  )
                  .filter((item) => !!item)}
              </div>,
              [[vShow, response.value === "mobile"]]
            )
          }
        </div>
      );
    };
  },
});

export { VtiNav };
