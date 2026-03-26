<script setup lang="ts">
import type { NavBrandProps } from "../../types";
import { useBem, useLink, useText } from "../../composables";

const props = defineProps<NavBrandProps>();

const { attr } = useLink(props);
const ns = useBem("nav-brand");
</script>

<template>
  <a v-bind="attr">
    <img :src="props.brand" alt="Brand" />
    <span>{{ useText(props.text) }}</span>
  </a>
</template>
