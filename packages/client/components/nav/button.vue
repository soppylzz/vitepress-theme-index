<script setup lang="ts">
import type { NavButtonProps } from "../../types";
import { useBem, useIcon, useLink, useText } from "../../composables";
import { hasOwnProperty } from "@vitepress-theme-index/shared";
import { computed } from "vue";

const props = defineProps<NavButtonProps>();
const ns = useBem("nav-button");

const { attr } = useLink(props);

const isTextMode = (props) => hasOwnProperty(props, "text") && !!props.text;

const kls = computed(() => ({
  wrap: ns.b(),
  link: ns.e("link"),
  tooltip: ns.e("tooltip"),
  arrow: ns.e("arrow"),
}));
</script>

<template>
  <div :class="kls.wrap">
    <a v-if="isTextMode(props)" v-bind="attr" :class="kls.link">
      <component :is="useIcon(props.icon)" v-if="props?.icon" />
      <span>{{ useText(props.text) }}</span>
    </a>
    <template v-else>
      <a v-bind="attr" :class="kls.link"><component :is="useIcon(props.icon)" /></a>
      <div v-if="props?.tooltip" :class="kls.tooltip">
        <div :class="kls.arrow"><!--  Tooltip Arrow  --></div>
        {{ useText(props.tooltip) }}
      </div>
    </template>
  </div>
</template>
