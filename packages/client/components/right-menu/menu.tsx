import type { PropType } from "vue";
import { defineComponent, nextTick, reactive, ref, vShow, watch, withDirectives } from "vue";
import type { MenuItemState, MenuTrigger } from "../../types";
import { useRightMenuProvide } from "../../utils";
import { useBem, useRMenuItem, useProvidePath } from "../../composables";
import { useRightMenu } from "./use-menu";

const rightMenuProps = {
  coords: Array as unknown as PropType<[number, number]>,
  state: {
    type: String as PropType<MenuItemState>,
    default: "enabled",
  },
  show: {
    type: Boolean,
    default: true,
  },
  trigger: {
    type: [Boolean, Array] as PropType<MenuTrigger>,
    default: true,
  },
};

const VtiRightMenu = defineComponent({
  name: "VtiRightMenu",
  props: rightMenuProps,
  setup(props, { slots }) {
    const { ctx } = useRightMenuProvide();

    const rect = ref<[number, number]>([-1, -1]);
    const render = ref(true);
    const menu = ref<HTMLElement | null>(null);
    const style = reactive({
      position: "fixed",
      visibility: "hidden",
      left: "0px",
      top: "0px",
    });

    watch(
      [() => props.show, () => props.coords, () => ctx.value.rect],
      async ([show, coords, pRect]) => {
        style.visibility = "hidden";
        if (!show) return;
        render.value = true;
        await nextTick();

        if (!menu.value || !coords) {
          render.value = false;
          return;
        }
        const clientRect = menu.value.getBoundingClientRect();
        rect.value = [clientRect.width, clientRect.height];

        const [x, y] = coords;
        const [pWidth, pHeight] = pRect;
        const canRenderLeft = x - clientRect.width >= 0;
        const canRenderTop = y + pHeight - clientRect.height >= 0;
        const canRenderRight = x + pWidth + clientRect.width <= window.innerWidth;
        const canRenderBottom = y + clientRect.height <= window.innerHeight;

        render.value =
          show && (canRenderTop || canRenderBottom) && (canRenderLeft || canRenderRight);

        style.left = canRenderRight ? `${x}px` : `${x - pWidth - clientRect.width}px`;
        style.top = canRenderBottom ? `${y}px` : `${y - clientRect.height + pHeight}px`;
        style.visibility = render.value ? "visible" : "hidden";
      },
      { immediate: true }
    );

    const {
      render: finalRender,
      size,
      state,
      stage,
    } = useRMenuItem(props, { render, state: () => props.state, selectable: true }, true);

    useRightMenu(finalRender);
    useProvidePath({ rect, state });

    const ns = useBem("right-menu");
    return () => {
      if (!render.value) return null;
      return withDirectives(
        <div
          ref={menu}
          class={[ns.b(), ns.m(size.value), ns.when(stage.value), ns.when(state.value)]}
          style={style}
        >
          {slots.default?.()}
        </div>,
        [[vShow, finalRender.value]]
      );
    };
  },
});

export { VtiRightMenu, rightMenuProps };
