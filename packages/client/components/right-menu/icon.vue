<script setup lang="ts">
import { computed } from "vue";
import type { IconItemEmits, IconItemProps } from "../../types";
import { useBem, useIcon, useMenuItem } from "../../composables";
import { useRightMenuProvide } from "../../utils";

const emits = defineEmits<IconItemEmits>();
const props = withDefaults(defineProps<IconItemProps>(), { closeOnActivate: true });

const { close } = useRightMenuProvide();
const { render, state, stage, size } = useMenuItem(props, {
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

const ns = useBem("item-icon");
const kls = computed(() => ({
  block: [ns.b(), ns.m(size.value)],
  container: [ns.e("container"), ns.when(stage.value), ns.when(state.value)],
}));
</script>

<template>
  <div v-show="render" :class="kls.block">
    <div :class="kls.container" @click.stop="activateFn">
      <component :is="useIcon(props.icon)" v-if="props.icon" />
    </div>
  </div>
</template>
