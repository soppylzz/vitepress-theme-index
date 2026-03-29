<script setup lang="ts">
import type { NavMenuGroupProps } from "../../types";
import { useBem, useText } from "../../composables";

const props = defineProps<NavMenuGroupProps>();
const ns = useBem("nav-menu-group");
</script>

<template>
  <div>
    <span>{{ useText(props.text) }}</span>
    <slot />
  </div>
</template>
