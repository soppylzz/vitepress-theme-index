<script setup lang="ts">
import type { MenuProps } from "../../types";
import { useBem } from "../../composables";
import { computed } from "vue";
import { provideMenuContext } from "../context";

const props = withDefaults(defineProps<MenuProps>(), {
  size: "medium",
  collapsed: false,
  showActivate: false,
});
provideMenuContext(props);

const ns = useBem("menu");
const kls = computed(() => ({ root: [ns.b(), ns.m(props.size)] }));
</script>
<template>
  <div :class="kls.root"><slot /></div>
</template>
