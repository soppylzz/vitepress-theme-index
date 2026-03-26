<script setup lang="ts">
import type { NavButtonIconProps, NavButtonProps, NavButtonTextProps } from "../../types";
import { useBem, useIcon, useLink, useText } from "../../composables";

const props = defineProps<NavButtonProps>();
const ns = useBem("nav-button");

const { attr } = useLink(props);

const isTextMode = (props: NavButtonProps): props is NavButtonTextProps => "text" in props;
const isIconMode = (props: NavButtonProps): props is NavButtonIconProps => "icon" in props;
</script>

<template>
  <div>
    <a v-if="isTextMode(props)" v-bind="attr">
      <component :is="useIcon(props.icon)" v-if="props?.icon" />
      <span>{{ useText(props.text) }}</span>
    </a>
    <template v-if="isIconMode(props)">
      <a v-bind="attr"><component :is="useIcon(props.icon)" /></a>
      <div v-if="props?.tooltip">
        <div><!--  Tooltip Arrow  --></div>
        {{ useText(props.tooltip) }}
      </div>
    </template>
  </div>
</template>
