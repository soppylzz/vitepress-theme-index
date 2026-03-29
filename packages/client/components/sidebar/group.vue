<script setup lang="ts">
import { useIcon, useText } from "../../composables";
import type { SidebarGroup } from "../../types";

const props = defineProps<SidebarGroup>();
</script>

<template>
  <div>
    <div>
      <div v-if="props?.icon"><component :is="useIcon(props.icon)" /></div>
      <span>{{ useText(props.text) }}</span>
    </div>
    <slot />
  </div>
</template>
