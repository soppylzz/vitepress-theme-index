<script setup lang="ts">
import type { BrandProps } from "../types";
import { useAttrsExist, useBem, useLink, useText } from "../composables";
import { computed } from "vue";

const emit = defineEmits<{ (e: "onActivate"): void }>();
const props = withDefaults(defineProps<BrandProps>(), {
  direction: "row",
  size: "medium",
  href: "/",
});
const { existed: hasActivate } = useAttrsExist("onActivate");
const handleClick = (e: MouseEvent) => {
  if (hasActivate.value) {
    emit("onActivate");
    e.preventDefault();
  }
};

const { attr } = useLink({ href: "/" });
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
    @click="handleClick"
  >
    <img :class="kls.logo" :src="props.brand" alt="Brand" />
    <span :class="kls.text">{{ useText(props.text) }}</span>
  </a>
</template>
