<script setup lang="ts">
import { computed } from "vue";
import type { RMenuTextEmits, RMenuTextProps } from "../../types";
import { useBem, useIcon, useRMenuItem, useText } from "../../composables";
import { useRightMenuProvide } from "../../utils";

const emits = defineEmits<RMenuTextEmits>();
const props = withDefaults(defineProps<RMenuTextProps>(), {
  align: "start",
  trigger: true,
  selectable: true,
  closeOnActivate: true,
});

const { close } = useRightMenuProvide();
const { render, state, stage, size } = useRMenuItem(props, {
  onChanged: (val) => {
    if (!val) return;
    emits("trigger");
  },
  onEnter: () => {
    activateFn();
  },
  onSelect: (key) => {
    emits("select", key);
  },
  selectable: () => props.selectable,
  state: () => props.state,
})!;

const activateFn = (evt?: MouseEvent) => {
  if (state.value === "disabled") return;
  const canActivate = emits("activateBefore", evt) !== false;
  if (canActivate) {
    emits("activate", evt);
    if (props.closeOnActivate) {
      close();
    }
  }
};

const Icon = useIcon(props.icon);
const ns = useBem("r-menu-text");
const kls = computed(() => ({
  wrap: [ns.b(), ns.m(size.value), ns.when(stage.value), ns.when(state.value)],
  text: [ns.e("text")],
}));
</script>

<template>
  <div v-show="render" :class="kls.wrap" @click.stop="activateFn">
    <Icon />
    <span :class="kls.text" v-bind="{ [`align-${props.align}`]: true }">{{
      useText(props.text)
    }}</span>
  </div>
</template>
