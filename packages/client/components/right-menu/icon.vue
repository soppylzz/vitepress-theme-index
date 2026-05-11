<script setup lang="ts">
import { computed } from "vue";
import type { RMenuIconEmits, RMenuIconProps } from "../../types";
import { useBem, useIcon, useRMenuItem } from "../../composables";
import { useRightMenuProvide } from "../../utils";

const emits = defineEmits<RMenuIconEmits>();
const props = withDefaults(defineProps<RMenuIconProps>(), {
  closeOnActivate: true,
  trigger: true,
  selectable: true,
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
  selectable: () => props.selectable ?? true,
  state: () => props.state,
});

const activateFn = (evt?: MouseEvent) => {
  if (state.value === "disabled") return;
  if (emits("activateBefore", evt) !== false) {
    emits("activate", evt);
    if (props.closeOnActivate) {
      close();
    }
  }
};

const Icon = useIcon(props.icon);
const ns = useBem("r-menu-icon");
const kls = computed(() => ({
  wrap: [ns.b(), ns.when(stage.value), ns.when(state.value), ns.m(size.value)],
}));
</script>

<template>
  <div v-show="render" :class="kls.wrap" @click.stop="activateFn">
    <Icon />
  </div>
</template>
