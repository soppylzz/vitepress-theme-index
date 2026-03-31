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

  const { placement } = props;
  const arrowGap = (arrowRect.width - 2 * borderWidth) / 2;
  const centerX = triggerRect.left + triggerRect.width / 2;
  const centerY = triggerRect.top + triggerRect.height / 2;

  if (["top", "bottom"].includes(placement)) {
    const left = centerX - contentRect.width / 2 - borderWidth;
    tooltipStyle.left = `${Math.max(0, Math.min(left, vw - contentRect.width))}px`;
    arrowStyle.left = `${centerX - arrowRect.width / 2 + borderWidth}px`;

    if (placement === "bottom") {
      tooltipStyle.top = `${triggerRect.bottom - borderWidth + 2 * arrowGap}px`;
      arrowStyle.top = `${triggerRect.bottom - borderWidth + arrowGap}px`;
    } else {
      tooltipStyle.top = `${triggerRect.top + borderWidth - contentRect.height - 2 * arrowGap}px`;
      arrowStyle.top = `${triggerRect.top - arrowRect.height + borderWidth - arrowGap}px`;
    }
  } else {
    const top = centerY - contentRect.height / 2 - borderWidth;
    tooltipStyle.top = `${Math.max(0, Math.min(top, vh - contentRect.height))}px`;
    arrowStyle.top = `${centerY - arrowRect.height / 2 + borderWidth}px`;

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
    <span :class="kls.trigger">
      <slot name="default" />
    </span>
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
