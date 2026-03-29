<script setup lang="ts">
import type { NavButtonProps } from "../../types";
import { useBem, useIcon, useLink, useText } from "../../composables";
import { hasOwnProperty } from "@vitepress-theme-index/shared";

const props = defineProps<NavButtonProps>();
const ns = useBem("nav-button");

const { attr } = useLink(props);

const isTextMode = (props) => hasOwnProperty(props, "text") && !!props.text;
</script>

<template>
  <div>
    <a v-if="isTextMode(props)" v-bind="attr">
      <component :is="useIcon(props.icon)" v-if="props?.icon" />
      <span>{{ useText(props.text) }}</span>
    </a>
    <template v-else>
      <a v-bind="attr"><component :is="useIcon(props.icon)" /></a>
      <div v-if="props?.tooltip">
        <div><!--  Tooltip Arrow  --></div>
        {{ useText(props.tooltip) }}
      </div>
    </template>
  </div>
</template>
