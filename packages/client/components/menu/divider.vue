<script setup lang="ts">
import { useBem } from "../../composables";
const ns = useBem("menu-divider");
</script>

<template>
  <div :class="ns.b()" />
</template>
