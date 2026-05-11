<script setup lang="ts">
import type { MenuButtonProps } from "../../types";
import { useBem, useText, useLink, hasEmitHook, useIcon, useMenuItem } from "../../composables";
import { computed } from "vue";

const props = defineProps<MenuButtonProps>();
const emit = defineEmits<{ (e: "activate"): void }>();

const hasHook = hasEmitHook("activate");
const { isActive, ctx, setActive } = useMenuItem();

const handleClick = () => {
  setActive();
  emit("activate");
};

const Icon = useIcon(props.icon);
const { attr } = useLink(props, hasHook);
const ns = useBem("menu-button");
const kls = computed(() => ({
  wrap: [ns.b(), ns.m(ctx.value.size), ns.when("active", isActive.value)],
}));
</script>

<template>
  <a v-bind="attr" :class="kls.wrap" @click="handleClick">
    <Icon />
    <span>{{ useText(props.text) }}</span>
  </a>
</template>
