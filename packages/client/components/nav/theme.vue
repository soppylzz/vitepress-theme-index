<script setup lang="ts">
import type { NavThemeProps } from "../../types";
import { useBem, useIndexTheme } from "../../composables";

const props = defineProps<NavThemeProps>();
const { ctx, cycle, set } = useIndexTheme();

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
