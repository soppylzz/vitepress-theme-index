<script setup lang="ts">
import { useBem } from "../../composables";
import { useMenuItem } from "../context";
import { computed } from "vue";

const { ctx } = useMenuItem();
const ns = useBem("menu-divider");
const kls = computed(() => [ns.b(), ns.m(ctx.value.size)]);
</script>

<template>
  <div :class="kls" />
</template>
