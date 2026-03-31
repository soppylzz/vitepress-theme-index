<script setup lang="ts">
import { computed } from "vue";
import type { RMenuDividerProps } from "../../types";
import { useBem, useRMenuItem, useText } from "../../composables";

const props = withDefaults(defineProps<RMenuDividerProps>(), { align: "center" });

const { render, size } = useRMenuItem(props);
const ns = useBem("r-menu-divider");
const kls = computed(() => ({
  block: [ns.b(), ns.m(size.value), ns.m(`align-${props.align}`)],
}));
</script>

<template>
  <div v-show="render" :class="kls.block">
    <span>{{ useText(props.text) }}</span>
  </div>
</template>
