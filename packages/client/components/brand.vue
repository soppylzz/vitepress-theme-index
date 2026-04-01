<script setup lang="ts">
import type { BrandProps } from "../types";
import { useBem, useLink, useText } from "../composables";
import { computed } from "vue";

const props = defineProps<BrandProps>();

const { attr } = useLink({ href: "/" });
const ns = useBem("brand");
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
