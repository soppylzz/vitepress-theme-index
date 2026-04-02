<script setup lang="ts">
import type { MenuButtonProps } from "../../types";
import { useBem, useText, useLink, useIcon, useAttrsExist } from "../../composables";
import { computed } from "vue";
import { useMenuItem } from "../context";

const props = defineProps<MenuButtonProps>();
const emit = defineEmits<{ (e: "onActivate"): void }>();

const { existed: hasActivate } = useAttrsExist("onActivate");
const { isActive, ctx, setActive } = useMenuItem();

const handleClick = (e: MouseEvent) => {
  setActive();
  if (hasActivate.value) {
    emit("onActivate");
    e.preventDefault();
  }
};

const { attr } = useLink(props);
const ns = useBem("menu-button");
const kls = computed(() => ({
  wrap: [ns.b(), ns.m(ctx.value.size), ns.when("active", isActive.value)],
}));
</script>

<template>
  <a v-bind="attr" :class="kls.wrap" @click="handleClick">
    <component :is="useIcon(props?.icon)" v-if="props?.icon" />
    <span>{{ useText(props.text) }}</span>
  </a>
</template>
