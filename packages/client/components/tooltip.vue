<script setup lang="ts">
import type { TooltipProps } from "../types";
import { useBem, useText } from "../composables";
import { computed, ref, nextTick, reactive, onBeforeUnmount } from "vue";
import { debounce } from "lodash-unified";
import type { CSSProperties } from "vue";

const props = withDefaults(defineProps<TooltipProps>(), {
  size: "small",
  tooltipDelay: 300,
  placement: "bottom",
});

const wrapRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();
const arrowRef = ref<HTMLElement>();

const tooltipStyle = reactive({ left: "0px", top: "0px", visibility: "hidden" });
const arrowStyle = reactive({ left: "0px", top: "0px", visibility: "hidden" });

const showTooltip = debounce(async () => {
  await calculatePosition();
}, props.tooltipDelay);

const hideTooltip = debounce(() => {
  tooltipStyle.visibility = "hidden";
  arrowStyle.visibility = "hidden";
}, props.tooltipDelay);

const handleMouseEnter = () => {
  hideTooltip.cancel();
  showTooltip();
};

const handleMouseLeave = () => {
  showTooltip.cancel();
  hideTooltip();
};

onBeforeUnmount(() => {
  showTooltip.cancel();
  hideTooltip.cancel();
});

const calculatePosition = async () => {
  if (!wrapRef.value || !contentRef.value || !arrowRef.value) return;

  await nextTick();

  const trigger = wrapRef.value.firstElementChild as HTMLElement;
  if (!trigger) return;

  const triggerRect = trigger.getBoundingClientRect();
  const contentRect = contentRef.value.getBoundingClientRect();
  const arrowEl = arrowRef.value;
  const arrowRect = arrowEl.getBoundingClientRect();

  const arrowComputedStyle = getComputedStyle(arrowEl);
  const borderWidth = parseFloat(arrowComputedStyle.borderWidth) || 0;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const arrowGap = (arrowRect.width - 2 * borderWidth) / 2;
  const { placement } = props;

  if (["top", "bottom"].includes(placement)) {
    const left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
    tooltipStyle.left = `${Math.max(0, Math.min(left, vw - contentRect.width))}px`;
    arrowStyle.left = `${triggerRect.left + triggerRect.width / 2 - arrowRect.width / 2}px`;

    if (placement === "bottom") {
      tooltipStyle.top = `${triggerRect.bottom - borderWidth + 2 * arrowGap}px`;
      arrowStyle.top = `${triggerRect.bottom - borderWidth + arrowGap}px`;
    } else {
      tooltipStyle.top = `${triggerRect.top + borderWidth - contentRect.height - 2 * arrowGap}px`;
      arrowStyle.top = `${triggerRect.top - arrowRect.height + borderWidth - arrowGap}px`;
    }
  } else {
    const top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
    tooltipStyle.top = `${Math.max(0, Math.min(top, vh - contentRect.height))}px`;
    arrowStyle.top = `${triggerRect.top + triggerRect.height / 2 - arrowRect.height / 2}px`;

    if (placement === "right") {
      tooltipStyle.left = `${triggerRect.right - borderWidth + arrowGap + arrowGap}px`;
      arrowStyle.left = `${triggerRect.right - borderWidth - arrowGap}px`;
    } else {
      tooltipStyle.left = `${triggerRect.left - contentRect.width + borderWidth - 2 * arrowGap}px`;
      arrowStyle.left = `${triggerRect.left + borderWidth - arrowRect.width + arrowGap}px`;
    }
  }

  tooltipStyle.visibility = "visible";
  arrowStyle.visibility = "visible";
};

const ns = useBem("tooltip");
const kls = computed(() => ({
  wrap: ns.b(),
  trigger: ns.e("trigger"),
  content: [ns.e("content"), ns.em("content", props.size)],
  arrow: [ns.e("arrow"), ns.em("arrow", props.size), ns.em("arrow", props.placement)],
}));
</script>

<template>
  <div
    ref="wrapRef"
    :class="kls.wrap"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot name="default" />
    <div
      v-if="$slots.content || props.tooltip"
      ref="contentRef"
      :class="kls.content"
      :style="tooltipStyle as CSSProperties"
    >
      <slot v-if="$slots.content" name="content" />
      <template v-else>{{ useText(props.tooltip) }}</template>
    </div>

    <div
      v-if="$slots.content || props.tooltip"
      ref="arrowRef"
      :class="kls.arrow"
      :style="arrowStyle as CSSProperties"
    />
  </div>
</template>
