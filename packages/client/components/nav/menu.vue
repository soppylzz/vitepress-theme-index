<script setup lang="ts">
import type { NavMenuProps } from "../../types";
import { useIcon, useText } from "../../composables";

const props = defineProps<NavMenuProps>();
</script>

<template>
  <div>
    <component :is="useIcon(props.icon)" v-if="props?.icon" />
    <span>{{ useText(props.text) }}</span>
  </div>
  <div>
    <slot />
  </div>
</template>
