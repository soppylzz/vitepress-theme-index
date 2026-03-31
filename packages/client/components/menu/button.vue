<script setup lang="ts">
import type { MenuButtonProps } from "../../types";
import { useBem, useText, useLink } from "../../composables";
import { computed, useAttrs } from "vue";
import { useMenuItem } from "./context";

const props = defineProps<MenuButtonProps>();
const emit = defineEmits<{ (e: "onActivate"): void }>();

const { attr } = useLink(props);

const attrs = useAttrs();
const hasOnActivate = computed(() => "onActivate" in attrs);
const { itemKey, menuContext, isActive } = useMenuItem();

const handleClick = (e: MouseEvent) => {
  menuContext.value?.setActiveKey?.(itemKey.value);
  if (hasOnActivate.value) {
    emit("onActivate");
    e.preventDefault();
  }
};

const ns = useBem("menu-button");
const kls = computed(() => ({
  item: [ns.b(), ns.when("active", isActive.value)],
  label: ns.e("label"),
  icon: ns.e("icon"),
}));
</script>

<template>
  <a v-bind="attr" :class="kls.item" @click="handleClick">
    <span v-if="props.icon" :class="kls.icon">{{ props.icon }}</span>
    <span :class="kls.label">{{ useText(props.text) }}</span>
  </a>
</template>
