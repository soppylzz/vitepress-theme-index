<script setup lang="ts">
import { useBem, useMenuItem } from "../../composables";
import { computed } from "vue";

const { ctx } = useMenuItem();
const ns = useBem("menu-divider");
const kls = computed(() => [ns.b(), ns.m(ctx.value.size)]);
</script>

<template>
  <div :class="kls" />
</template>
