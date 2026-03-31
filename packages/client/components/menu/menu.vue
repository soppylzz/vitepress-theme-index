<script setup lang="ts">
import type { MenuProps } from "../../types";
import { useBem } from "../../composables";
import { computed } from "vue";
import { provideMenuContext } from "./context";

const props = defineProps<MenuProps>();
const ctx = provideMenuContext(props.showActivate);

const activeKey = computed(() => ctx.value?.activeKey);

const ns = useBem("menu");
const kls = computed(() => ({
  root: [ns.b(), ns.when("activated", !!activeKey.value)],
}));
</script>
<template>
  <div :class="kls.root">
    <slot />
  </div>
</template>
