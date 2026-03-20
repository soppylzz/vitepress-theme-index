<script setup lang="ts">
import type { NavBrandProps } from "../../types";
import { useBem, useLink, useText } from "../../composables";

const props = defineProps<NavBrandProps>();

const { attr } = useLink(props);
const ns = useBem("nav-brand");
</script>

<template>
  <a v-bind="attr">
    <slot name="nav-brand-before" />
    <slot name="nav-brand">
      <img :src="props.brand" alt="Brand" />
    </slot>
    <span>{{ useText(props.text) }}</span>
    <slot name="nav-brand-after" />
  </a>
</template>
