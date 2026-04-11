<script setup lang="ts">
import type { MenuGroupProps } from "../../types";
import { useBem, useText } from "../../composables";
import { computed, ref } from "vue";
import { provideMenuContext, useMenuItem } from "../context";

provideMenuContext();
const props = withDefaults(defineProps<MenuGroupProps>(), { collapsable: false });

const { ctx } = useMenuItem();
const isExpanded = ref(props.collapsable ? !ctx.value.collapsed : true);

const ns = useBem("menu-group");
const kls = computed(() => ({
  wrap: [ns.b(), ns.m(ctx.value.size)],
  button: [ns.e("button"), ns.when("collapsed", props.collapsable && !isExpanded.value)],
  header: ns.e("header"),
  children: [ns.e("children"), ns.em("children", ctx.value.size)],
}));
</script>

<template>
  <div :class="kls.wrap">
    <div v-if="props.collapsable" :class="kls.button" @click="isExpanded = !isExpanded">
      <span>{{ useText(props.text) }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <!--! Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
        <path
          d="M140.3 376.8c12.6 10.2 31.1 9.5 42.8-2.2l128-128c9.2-9.2 11.9-22.9 6.9-34.9S301.4 192 288.5 192l-256 0c-12.9 0-24.6 7.8-29.6 19.8S.7 237.5 9.9 246.6l128 128 2.4 2.2z"
        />
      </svg>
    </div>
    <div v-else :class="kls.header">
      {{ useText(props.text) }}
    </div>
    <div v-if="!props.collapsable || isExpanded" :class="kls.children">
      <slot />
    </div>
  </div>
</template>
