<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { debounce } from "lodash-unified";
import type { RMenuSubMenuEmits, RMenuSubMenuProps } from "../../types";
import { useBem, useIcon, useRMenuItem, useProvidePath, useText } from "../../composables";
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

const expandFn = debounce(async (evt: MouseEvent | KeyboardEvent) => {
  if (state.value === "disabled") return;
  if (evt.type !== "keydown" && evt.type !== props.activateEvent) return;
  if (props.activateEvent === "click" && evt.type === "mouseenter") return;
  if (!show.value) {
    if (emits("activateBefore", evt) !== false) {
      emits("activate", evt);
      show.value = true;
      await updatePosition();
    }
  }
}, 100);

const closeFn = () => {
  if (!show.value) return;
  expandFn.cancel();
  emits("deactivate");
  show.value = false;
};

useProvidePath({ rect }, { onClose: closeFn });

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
    await expandFn(e);
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
  <div v-show="render" ref="button" :class="kls.wrap" @mouseenter="expandFn" @click.stop="expandFn">
    <component :is="useIcon(props?.icon)" v-if="props?.icon" />
    <span :class="kls.text" v-bind="{ [`align-${props.align}`]: true }">
      {{ useText(props.text) }}
    </span>
    <component :is="useIcon(props?.expandIcon)" v-if="props?.expandIcon" />
    <!--  out of dom-flow  -->
    <VtiRightMenu :trigger="props.trigger" :show="show" :coords="coords">
      <slot />
    </VtiRightMenu>
  </div>
</template>
