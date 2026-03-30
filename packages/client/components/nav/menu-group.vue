<script setup lang="ts">
import { ref, computed } from "vue";
import type { NavMenuGroupProps } from "../../types";
import { useBem, useText } from "../../composables";

const props = defineProps<NavMenuGroupProps>();
const expanded = ref(true);

const ns = useBem("nav-menu-group");

const kls = computed(() => ({
  wrap: ns.b(),
  title: ns.e("title"),
  button: [ns.e("button"), ns.when("expanded", expanded.value)],
  children: [ns.e("children"), ns.when("hidden", !expanded.value)],
}));
</script>

<template>
  <div :class="kls.wrap">
    <div style="display: flex; align-items: center; gap: 0.5em">
      <span :class="kls.title">{{ useText(props.text) }}</span>
      <button :class="kls.button" @click="expanded = !expanded">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
    <div :class="kls.children">
      <slot />
    </div>
  </div>
</template>
