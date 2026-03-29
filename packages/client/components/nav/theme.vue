<script setup lang="ts">
import type { NavThemeProps } from "../../types";
import { useBem, useIndex } from "../../composables";

const props = defineProps<NavThemeProps>();
const { theme } = useIndex();

const ns = useBem("nav-theme");
</script>

<template>
  <div>
    <!-- Wheel Picker -->
    <div />
    <!-- Three stage switch button -->
    <div>
      <div />
    </div>
  </div>
</template>
