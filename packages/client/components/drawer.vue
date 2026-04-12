<script setup lang="ts">
import type { DrawerEmits, DrawerProps } from "../types";
import { useBem } from "../composables";
import { computed, ref } from "vue";

const emits = defineEmits<DrawerEmits>();
const model = defineModel<boolean>({ default: false });
const props = withDefaults(defineProps<DrawerProps>(), {
  placement: "left",
  resizable: false,
  touchable: false,
  size: "medium",
});

const content = ref<HTMLElement | null>(null);
function handleClick(e: MouseEvent) {
  if (!content.value || !content.value.contains(e.target as Node)) {
    emits("close");
    model.value = false;
  }
}

const ns = useBem("drawer");
const kls = computed(() => ({
  wrap: ns.b(),
  dragger: [ns.e("dragger"), ns.when("resizable", props.resizable)],
  content: ns.e("content"),
}));
</script>

<template>
  <div v-show="model" :class="kls.wrap" @click="handleClick">
    <div :class="kls.dragger"><!--  resizable dragger  --></div>
    <div ref="content" :class="kls.content"><slot /></div>
  </div>
</template>
