<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { debounce } from "lodash-unified";
import type { SubMenuItemEmits, SubMenuItemProps } from "../../types";
import { useBem, useIcon, useMenuItem, useProvidePath, useText } from "../../composables";
import { useNavMove } from "../../utils";
import { RightMenu } from "./menu";

const emits = defineEmits<SubMenuItemEmits>();
const props = withDefaults(defineProps<SubMenuItemProps>(), {
  size: "medium",
  activateEvent: "mouseenter",
});

const show = ref(false);
const button = ref<HTMLElement | null>(null);
const coords = ref<[number, number]>([0, 0]);
const rect = ref<[number, number]>([0, 0]);

const expandFn = debounce(async (evt: MouseEvent | KeyboardEvent) => {
  if (state.value === "disabled") return;
  if (evt.type !== "keydown" && evt.type !== props.activateEvent) return;
  if (props.activateEvent === "click" && evt.type === "mouseenter") return;
  if (!show.value) {
    if (emits("onActivateBefore", evt) !== false) {
      emits("onActivate", evt);
      show.value = true;

      await nextTick();
      if (!button.value) return;
      const clientRect = button.value.getBoundingClientRect();
      rect.value = [clientRect.width, clientRect.height];
      coords.value = [clientRect.right, clientRect.top];
    }
  }
}, 100);

const closeFn = () => {
  expandFn.flush();
  emits("onDeactivate");
  show.value = false;
};

useProvidePath({ rect }, { onClose: closeFn });

const { enterChild } = useNavMove();
const { render, state, size, stage, opened } = useMenuItem(props, {
  onChanged: (val) => {
    if (!val) return;
    emits("onTrigger");
  },
  onSelect: (key) => {
    emits("onSelect", key);
  },
  onEnter: async (e) => {
    await expandFn(e);
    enterChild();
  },
  selectable: () => props?.selectable ?? true,
  state: () => props?.state,
});

watch(opened, (val) => {
  if (!val) {
    show.value = false;
  }
});

const ns = useBem("item-submenu");
const kls = computed(() => ({
  container: [ns.b(), ns.m(size.value), ns.when(stage.value), ns.when(state.value)],
  left: ns.e("left-icon"),
  text: [ns.e("text"), ns.em("text", `align-${props.align}`)],
  expand: ns.e("expand-icon"),
}));
</script>

<template>
  <div v-show="render">
    <RightMenu :trigger="props.trigger" :show="show && opened" :coords="coords">
      <slot />
    </RightMenu>
    <div ref="button" :class="kls.container" @mouseenter="expandFn" @click.stop="expandFn">
      <span :class="kls.left"><component :is="useIcon(props?.icon)" v-if="props?.icon" /></span>
      <span :class="kls.text">{{ useText(props.text) }}</span>
      <span :class="kls.expand"
        ><component :is="useIcon(props?.expandIcon)" v-if="props?.expandIcon"
      /></span>
    </div>
  </div>
</template>
