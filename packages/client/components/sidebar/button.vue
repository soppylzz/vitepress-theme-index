<script setup lang="ts">
import type { SidebarButton } from "../../types";
import { useIcon, useText } from "../../composables";

const props = defineProps<SidebarButton>();
</script>

<template>
  <div>
    <div v-if="props?.icon"><component :is="useIcon(props.icon)" /></div>
    <span>{{ useText(props.text) }}</span>
  </div>
</template>
