<script setup lang="ts">
import { computed } from "vue";
import type { DividerItemProps } from "../../types";
import { useBem, useMenuItem, useText } from "../../composables";

const props = withDefaults(defineProps<DividerItemProps>(), { align: "center" });

const { render, size } = useMenuItem(props);
const ns = useBem("item-divider");
const kls = computed(() => ({
  block: [ns.b(), ns.m(size.value), ns.m(`align-${props.align}`)],
}));
</script>

<template>
  <div v-show="render" :class="kls.block">
    <span>{{ useText(props.text) }}</span>
  </div>
</template>
