<script setup lang="ts">
import { computed } from "vue";
import type { RMenuTextEmits, RMenuTextProps } from "../../types";
import { useBem, useIcon, useRMenuItem, useText } from "../../composables";
import { useRightMenuProvide } from "../../utils";

const emits = defineEmits<RMenuTextEmits>();
const props = withDefaults(defineProps<RMenuTextProps>(), {
  align: "start",
  closeOnActivate: true,
});

const { close } = useRightMenuProvide();
const { render, state, stage, size } = useRMenuItem(props, {
  onChanged: (val) => {
    if (!val) return;
    emits("onTrigger");
  },
  onEnter: () => {
    activateFn();
  },
  onSelect: (key) => {
    emits("onSelect", key);
  },
  selectable: () => props.selectable ?? true,
  state: () => props.state,
});

const activateFn = (evt?: MouseEvent) => {
  const canActivate = emits("onActivateBefore", evt) !== false;
  if (canActivate) {
    emits("onActivate", evt);
    if (props.closeOnActivate) {
      close();
    }
  }
};

const ns = useBem("r-menu-text");
const kls = computed(() => ({
  container: [ns.b(), ns.m(size.value), ns.when(stage.value), ns.when(state.value)],
  icon: ns.e("icon"),
  text: [ns.e("text"), ns.em("text", `align-${props.align}`)],
}));
</script>

<template>
  <div v-show="render">
    <div :class="kls.container" @click.stop="activateFn">
      <span :class="kls.icon"><component :is="useIcon(props.icon)" v-if="props.icon" /></span>
      <span :class="kls.text">{{ useText(props.text) }}</span>
    </div>
  </div>
</template>
