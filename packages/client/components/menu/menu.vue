<script setup lang="ts">
import type { MenuProps } from "../../types";
import { useBem } from "../../composables";
import { provideMenuContext } from "./context";
import { computed } from "vue";

const props = withDefaults(defineProps<MenuProps>(), {
  size: "medium",
  showActivate: false,
  isCollapsed: false,
});
provideMenuContext(props);

const ns = useBem("menu");
const kls = computed(() => ({ root: [ns.b(), ns.m(props.size)] }));
</script>
<template>
  <div :class="kls.root"><slot /></div>
</template>
