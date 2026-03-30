<script setup lang="ts">
import type { NavThemeProps } from "../../types";
import { useBem, useIndex } from "../../composables";

const props = defineProps<NavThemeProps>();
const { theme } = useIndex();

const ns = useBem("nav-theme");
</script>

<template>
  <div :class="ns.b()">
    <!-- Wheel Picker -->
    <div :class="ns.e('wheel')" />
    <!-- Three stage switch button -->
    <div :class="ns.e('switch')">
      <div :class="ns.e('indicator')" />
    </div>
  </div>
</template>
