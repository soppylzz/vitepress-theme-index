<script setup lang="ts">
import type { BrandProps } from "../types";
import { hasEmitHook, useBem, useLink, useText } from "../composables";
import { computed } from "vue";

const emit = defineEmits<{ (e: "activate"): void }>();
const props = withDefaults(defineProps<BrandProps>(), {
  direction: "row",
  size: "medium",
  href: "/",
});
const hasHook = hasEmitHook("activate");
const { attr } = useLink({ href: "/" }, hasHook);
const ns = useBem("brand");
const kls = computed(() => ({
  wrap: ns.b(),
  text: ns.e("text"),
  logo: ns.e("logo"),
}));
</script>

<template>
  <a
    v-bind="attr"
    :class="kls.wrap"
    :data-size="size"
    :data-direction="direction"
    @click="emit('activate')"
  >
    <img v-if="props.brand" :class="kls.logo" :src="props.brand" alt="Brand" />
    <span :class="kls.text">{{ useText(props.text) }}</span>
  </a>
</template>
