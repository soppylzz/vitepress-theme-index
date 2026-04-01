<script setup lang="ts">
import type { MenuGroupProps } from "../../types";
import { useBem, useText } from "../../composables";
import { computed, ref } from "vue";
import { provideMenuContext, useMenuItem } from "./context";

const props = withDefaults(defineProps<MenuGroupProps>(), { collapsed: false });
provideMenuContext();

const { size, ctx } = useMenuItem();
const isExpanded = ref(props.collapsed ? !ctx.value.isCollapsed : true);

const ns = useBem("menu-group");
const kls = computed(() => ({
  wrap: [ns.b(), ns.when("collapsed", props.collapsed && !isExpanded.value)],
  button: [ns.e("button"), ns.em("button", size.value)],
  children: ns.em("children", size.value),
  header: ns.em("header", size.value),
}));

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div :class="kls.wrap">
    <div v-if="props.collapsed" :class="kls.button" @click="toggleExpanded">
      <span>{{ useText(props.text) }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <!--! Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
        <path
          d="M140.3 376.8c12.6 10.2 31.1 9.5 42.8-2.2l128-128c9.2-9.2 11.9-22.9 6.9-34.9S301.4 192 288.5 192l-256 0c-12.9 0-24.6 7.8-29.6 19.8S.7 237.5 9.9 246.6l128 128 2.4 2.2z"
        />
      </svg>
    </div>
    <div v-else :class="kls.header">
      <span>{{ useText(props.text) }}</span>
    </div>
    <div v-if="!props.collapsed || isExpanded" :class="kls.children">
      <slot />
    </div>
  </div>
</template>
