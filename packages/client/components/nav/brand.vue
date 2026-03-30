<script setup lang="ts">
import type { NavBrandProps } from "../../types";
import { useBem, useLink, useText } from "../../composables";
import { computed } from "vue";

const props = defineProps<NavBrandProps>();

const { attr } = useLink(props);
const ns = useBem("nav-brand");
const kls = computed(() => ({
  wrap: ns.b(),
  text: ns.e("text"),
  logo: ns.e("logo"),
}));
</script>

<template>
  <a v-bind="attr" :class="kls.wrap">
    <img :class="kls.logo" :src="props.brand" alt="Brand" />
    <span :class="kls.text">{{ useText(props.text) }}</span>
  </a>
</template>
