<script setup lang="ts">
import type { BrandProps } from "../types";
import { useBem, useLink, useText } from "../composables";
import { computed, useAttrs } from "vue";

const emit = defineEmits<{ (e: "onActivate"): void }>();
const props = withDefaults(defineProps<BrandProps>(), {
  direction: "row",
  size: "medium",
  href: "/",
});

const attrs = useAttrs();
const hasOnActivate = computed(() => "onActivate" in attrs);

const { attr } = useLink({ href: "/" });
const handleClick = (e: MouseEvent) => {
  if (hasOnActivate.value) {
    emit("onActivate");
    e.preventDefault();
  }
};

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
