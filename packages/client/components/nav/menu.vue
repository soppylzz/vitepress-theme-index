<script setup lang="ts">
import { ref, computed } from "vue";
import type { NavMenuProps } from "../../types";
import { useBem, useIcon, useText } from "../../composables";

const props = defineProps<NavMenuProps>();
const expanded = ref(false);

const ns = useBem("nav-menu");

const kls = computed(() => ({
  wrap: ns.b(),
  trigger: [ns.e("trigger"), ns.when("expanded", expanded.value)],
  popup: [ns.e("popup"), ns.when("visible", expanded.value)],
}));
</script>

<template>
  <div :class="kls.wrap">
    <div :class="kls.trigger" @click="expanded = !expanded">
      <component :is="useIcon(props.icon)" v-if="props?.icon" />
      <span>{{ useText(props.text) }}</span>
    </div>
    <div :class="kls.popup"><slot /></div>
  </div>
</template>
