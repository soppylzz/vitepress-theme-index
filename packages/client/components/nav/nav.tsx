import type { Component, VNode } from "vue";
import { watch, watchEffect, ref, createVNode, defineComponent, vShow, withDirectives } from "vue";
import { useBem, useIndex, useMaybeI18nData } from "../../composables";
import { isBoolean, isUndefined, omit } from "lodash-unified";
import type {
  IndexResponse,
  MenuItemConfig,
  NavContainer,
  NavCustomConfig,
  NavItemConfig,
  NavItemType,
} from "../../types";
import { VtiNavButton, VtiNavMenu, VtiNavSwitch } from "./items";
import { ensureArray, hasOwnProperty } from "@vitepress-theme-index/shared";
import { renderMenuItems } from "../menu";
import VtiBrand from "../brand.vue";
import { useRoute } from "vitepress";

const ns = useBem("nav");
const bems = {
  divider: useBem("nav-divider"),
  space: useBem("nav-space"),
};

interface NavRenderContext {
  current: IndexResponse;
  container: NavContainer;
}
const navItemMap: Record<NavItemType, Component | undefined> = {
  button: VtiNavButton,
  menu: VtiNavMenu,
  divider: undefined,
  space: undefined,
  custom: undefined,
};

function computeVisible(config: NavItemConfig, ctx: NavRenderContext) {
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

function checkRender(config: NavItemConfig, container: NavContainer) {
  const target = config?.target || "header";
  return target === container || target === "both";
}

function checkIconButton(config: NavItemConfig) {
  if (config.type !== "button") return false;
  const buttonConfig = config as NavItemConfig & { text?: any };
  return !hasOwnProperty(buttonConfig, "text") || !buttonConfig.text;
}

function renderContentByType(
  key: number | string,
  config: NavItemConfig,
  ctx: NavRenderContext
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
  ctx: NavRenderContext
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
    const { response } = useIndex().theme;
    const { nav, site } = useIndex();

    const itemsRef = useMaybeI18nData(nav, []);
    const siteRef = useMaybeI18nData(site, undefined);

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

    const route = useRoute();
    watch(
      route,
      () => {
        open.value = false;
      },
      { immediate: true }
    );

    return () => {
      const current = response.value;

      const kls = {
        wrapper: [ns.b(), ns.m(current)],
        header: [ns.e("header"), ns.em("header", current)],
        screen: [ns.e("screen")],
        screenItems: [ns.e("screen-items")],
        screenIcons: [ns.e("screen-icons")],
      };

      const screenItems = itemsRef.value
        .filter((item) => checkRender(item, "screen"))
        .filter((item) => !checkIconButton(item));
      const screenIcons = itemsRef.value
        .filter((item) => checkRender(item, "screen"))
        .filter((item) => checkIconButton(item));

      return (
        <div class={kls.wrapper}>
          <div class={kls.header}>
            {<VtiBrand text={siteRef.value.siteName} brand={siteRef.value.brand} size={"medium"} />}
            {
              /* header container */
              itemsRef.value
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
                {/* Normal items (with text buttons, menus, etc.) */}
                <div class={kls.screenItems}>
                  {screenItems
                    .map((item, index) =>
                      renderNavItem(index, item, { current, container: "screen" })
                    )
                    .filter((item) => !!item)}
                </div>
                {/* Icon only buttons */}
                {screenIcons.length > 0 && (
                  <div class={kls.screenIcons}>
                    {screenIcons
                      .map((item, index) =>
                        renderNavItem(index, item, { current, container: "screen" })
                      )
                      .filter((item) => !!item)}
                  </div>
                )}
              </div>,
              [[vShow, response.value === "mobile" && open.value]]
            )
          }
        </div>
      );
    };
  },
});

export { VtiNav };
