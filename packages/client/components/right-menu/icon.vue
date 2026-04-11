<script setup lang="ts">
import { computed } from "vue";
import type { RMenuIconEmits, RMenuIconProps } from "../../types";
import { useBem, useIcon, useRMenuItem } from "../../composables";
import { useRightMenuProvide } from "../../utils";

const emits = defineEmits<RMenuIconEmits>();
const props = withDefaults(defineProps<RMenuIconProps>(), { closeOnActivate: true });

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
  if (emits("onActivateBefore", evt) !== false) {
    emits("onActivate", evt);
    if (props.closeOnActivate) {
      close();
    }
  }
};

const ns = useBem("r-menu-icon");
const kls = computed(() => ({
  wrap: [ns.b(), ns.when(stage.value), ns.when(state.value), ns.m(size.value)],
}));
</script>

<template>
  <div v-show="render" :class="kls.wrap" @click.stop="activateFn">
    <component :is="useIcon(props.icon)" v-if="props.icon" />
  </div>
</template>
