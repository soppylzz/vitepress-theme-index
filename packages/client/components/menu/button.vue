<script setup lang="ts">
import type { MenuButtonProps } from "../../types";
import { useBem, useText, useLink, useIcon } from "../../composables";
import { computed, useAttrs } from "vue";
import { useMenuItem } from "./context";

const props = defineProps<MenuButtonProps>();
const emit = defineEmits<{ (e: "onActivate"): void }>();

const { attr } = useLink(props);

const attrs = useAttrs();
const hasOnActivate = computed(() => "onActivate" in attrs);
const { key, ctx, isActive, size } = useMenuItem();

const handleClick = (e: MouseEvent) => {
  ctx.value?.setActiveKey?.(key.value);
  if (hasOnActivate.value) {
    emit("onActivate");
    e.preventDefault();
  }
};

const ns = useBem("menu-button");
const kls = computed(() => ({
  wrap: [ns.b(), ns.when("active", isActive.value), ns.m(size.value)],
}));
</script>

<template>
  <a v-bind="attr" :class="kls.wrap" @click="handleClick">
    <component :is="useIcon(props?.icon)" v-if="props?.icon" />
    <span>{{ useText(props.text) }}</span>
  </a>
</template>
