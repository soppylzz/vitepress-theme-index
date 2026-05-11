<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { debounce } from "lodash-unified";
import type { RMenuSubMenuEmits, RMenuSubMenuProps } from "../../types";
import { useBem, useRMenuItem, useProvidePath, useText, useIcon } from "../../composables";
import { useNavMove } from "../../utils";
import { VtiRightMenu } from "./menu";

const emits = defineEmits<RMenuSubMenuEmits>();
const props = withDefaults(defineProps<RMenuSubMenuProps>(), {
  size: "medium",
  trigger: true,
  selectable: true,
  activateEvent: "mouseenter",
});

const show = ref(false);
const button = ref<HTMLElement | null>(null);
const coords = ref<[number, number]>([0, 0]);
const rect = ref<[number, number]>([0, 0]);

const updatePosition = async () => {
  await nextTick();
  if (!button.value) return;

  const clientRect = button.value.getBoundingClientRect();
  rect.value = [clientRect.width, clientRect.height];
  coords.value = [clientRect.right, clientRect.top];
};

const doClose = () => {
  if (!show.value) return;
  emits("deactivate");
  show.value = false;
};

const doExpand = async (evt: MouseEvent | KeyboardEvent) => {
  if (state.value === "disabled") return;
  if (evt.type !== "keydown" && evt.type !== props.activateEvent) return;
  if (props.activateEvent === "click" && evt.type === "mouseenter" && show.value) {
    doClose();
    return;
  }
  if (
    emits("activateBefore", evt) !== false &&
    !(props.activateEvent === "click" && evt.type === "mouseenter")
  ) {
    emits("activate", evt);
    show.value = true;
    await updatePosition();
  }
};

const dbExpand = debounce(doExpand, 100);
const dbClose = debounce(doClose, 500);

const expandFn = (evt: MouseEvent | KeyboardEvent) => {
  dbClose.cancel();
  if (!show.value) dbExpand(evt);
};

const closeFn = (evt: MouseEvent | KeyboardEvent) => {
  dbExpand.cancel();
  dbClose();
};

useProvidePath({ rect }, { onClose: doClose });

const { enterChild } = useNavMove();
const { render, state, size, stage, opened } = useRMenuItem(props, {
  onChanged: (val) => {
    if (!val) return;
    emits("trigger");
  },
  onSelect: (key) => {
    emits("select", key);
  },
  onEnter: async (e) => {
    await doExpand(e);
    enterChild();
  },
  selectable: () => props.selectable,
  state: () => props.state,
});

watch(opened, async (val) => {
  if (!val) {
    show.value = false;
  } else {
    if (!show.value) {
      show.value = true;
      await updatePosition();
    }
  }
});

const IconExpand = useIcon(props.expandIcon);
const IconBase = useIcon(props.icon);
const ns = useBem("r-menu-submenu");
const kls = computed(() => ({
  wrap: [
    ns.b(),
    ns.m(size.value),
    ns.when(stage.value),
    ns.when(state.value),
    ns.when("opened", opened.value),
  ],
  text: [ns.e("text")],
}));
</script>

<template>
  <div
    v-show="render"
    ref="button"
    :class="kls.wrap"
    @mouseenter="expandFn"
    @mouseleave="closeFn"
    @click.stop="expandFn"
  >
    <IconBase />
    <span :class="kls.text" v-bind="{ [`align-${props.align}`]: true }">
      {{ useText(props.text) }}
    </span>
    <IconExpand />
    <!--  out of flow  -->
    <VtiRightMenu :trigger="props.trigger" :show="show" :coords="coords">
      <slot />
    </VtiRightMenu>
  </div>
</template>
