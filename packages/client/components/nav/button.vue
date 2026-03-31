<script setup lang="ts">
import type { NavButtonProps } from "../../types";
import { useBem, useIcon, useLink, useText } from "../../composables";
import { hasOwnProperty } from "@vitepress-theme-index/shared";
import { computed, useAttrs } from "vue";
import Tooltip from "../tooltip.vue";

const attrs = useAttrs();
const hasOnActivate = computed(() => "onActivate" in attrs);

const emit = defineEmits<{ (e: "onActivate"): void }>();
const props = withDefaults(defineProps<NavButtonProps>(), {
  tooltipDelay: 300,
});

const { attr } = useLink(props);

const isTextMode = (props: any) => hasOwnProperty(props, "text") && !!props.text;
const hasTooltip = (props: any) =>
  hasOwnProperty(props, "tooltip") && !!useText(props.tooltip)?.trim();

const handleClick = (e: MouseEvent) => {
  if (hasOnActivate.value) {
    emit("onActivate");
    e.preventDefault();
  }
};

const ns = useBem("nav-button");
const kls = computed(() => ({
  wrap: [ns.b()],
  link: ns.e("link"),
}));
</script>

<template>
  <div :class="kls.wrap">
    <a v-if="isTextMode(props)" v-bind="attr" :class="kls.link" @click="handleClick">
      <component :is="useIcon(props.icon)" v-if="props?.icon" />
      <span>{{ useText(props.text) }}</span>
    </a>
    <template v-else>
      <a v-if="hasTooltip(props)" v-bind="attr" :class="kls.link" @click="handleClick">
        <Tooltip
          size="small"
          placement="bottom"
          :tooltip="useText(props.tooltip) || ''"
          :tooltip-delay="props.tooltipDelay"
        >
          <component :is="useIcon(props.icon)" />
        </Tooltip>
      </a>
      <a v-else v-bind="attr" :class="kls.link" @click="handleClick">
        <component :is="useIcon(props.icon)" />
      </a>
    </template>
  </div>
</template>
