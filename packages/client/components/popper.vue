<script setup lang="ts">
import type { PopperProps, IndexPlacement } from "../types";
import { useBem, useText } from "../composables";
import { computed, ref, nextTick, reactive, onBeforeUnmount } from "vue";
import { debounce } from "lodash-unified";
import type { CSSProperties } from "vue";

const props = withDefaults(defineProps<PopperProps>(), {
  delay: 300,
  size: "small",
  placement: "bottom",
  activateEvent: "mouseenter",
  mode: "inline",
  autoPlace: false,
});

const wrapRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();
const arrowRef = ref<HTMLElement>();
const isVisible = ref(false);
const currentPlacement = ref<IndexPlacement>(props.placement);

const styles = reactive({
  popper: { left: "0px", top: "0px", visibility: "hidden" },
  arrow: { left: "0px", top: "0px", visibility: "hidden" },
});

const showPopper = async () => {
  isVisible.value = true;
  await nextTick();
  await calculatePosition();
};

const hidePopper = () => {
  styles.popper.visibility = "hidden";
  styles.arrow.visibility = "hidden";
  isVisible.value = false;
};

const showPopperDelayed = debounce(showPopper, props.delay);
const hidePopperDelayed = debounce(hidePopper, props.delay);

const handleMouseenter = () => {
  hidePopperDelayed.cancel();
  if (props.activateEvent === "mouseenter") {
    showPopperDelayed();
  }
};

const handleMouseleave = () => {
  showPopperDelayed.cancel();
  hidePopperDelayed();
};

const handleClick = async () => {
  if (props.activateEvent === "click") {
    if (!isVisible.value) {
      await showPopper();
    }
  }
};

onBeforeUnmount(() => {
  showPopperDelayed.cancel();
  hidePopperDelayed.cancel();
});

const calculatePosition = async () => {
  if (!wrapRef.value || !contentRef.value || !arrowRef.value) return;

  const trigger = wrapRef.value.firstElementChild as HTMLElement;
  if (!trigger) return;

  const triggerRect = trigger.getBoundingClientRect();
  const contentRect = contentRef.value.getBoundingClientRect();
  const arrowEl = arrowRef.value;
  const arrowRect = arrowEl.getBoundingClientRect();

  const borderWidth = parseFloat(getComputedStyle(arrowEl).borderWidth) || 0;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let placement = props.placement;
  const arrowGap = (arrowRect.width - 2 * borderWidth) / 2;
  const centerX = triggerRect.left + triggerRect.width / 2;
  const centerY = triggerRect.top + triggerRect.height / 2;

  // Check if placement fits in viewport
  const canFit = (p: IndexPlacement): boolean => {
    const fits: Record<IndexPlacement, boolean> = {
      top: triggerRect.top - contentRect.height - arrowGap > 0,
      bottom: triggerRect.bottom + contentRect.height + arrowGap < vh,
      left: triggerRect.left - contentRect.width - arrowGap > 0,
      right: triggerRect.right + contentRect.width + arrowGap < vw,
    };
    return fits[p] ?? true;
  };

  // Auto-place: try opposite if current placement doesn't fit
  if (props.autoPlace && !canFit(placement)) {
    const opposite: Record<IndexPlacement, IndexPlacement> = {
      top: "bottom",
      bottom: "top",
      left: "right",
      right: "left",
    };
    placement = canFit(opposite[placement]) ? opposite[placement] : placement;
  }

  currentPlacement.value = placement;

  // Helper functions for position calculation
  const clampX = (x: number) => Math.max(0, Math.min(x, vw - contentRect.width));
  const clampY = (y: number) => Math.max(0, Math.min(y, vh - contentRect.height));

  // Calculate position based on placement
  if (placement === "top" || placement === "bottom") {
    const isBottom = placement === "bottom";
    styles.popper.left = `${clampX(centerX - contentRect.width / 2 - borderWidth)}px`;
    styles.popper.top = `${isBottom ? triggerRect.bottom - borderWidth + 2 * arrowGap : triggerRect.top + borderWidth - contentRect.height - 2 * arrowGap}px`;
    styles.arrow.left = `${centerX - arrowRect.width / 2 + borderWidth}px`;
    styles.arrow.top = `${isBottom ? triggerRect.bottom - borderWidth + arrowGap : triggerRect.top - arrowRect.height + borderWidth - arrowGap}px`;
  } else {
    const isRight = placement === "right";
    styles.popper.top = `${clampY(centerY - contentRect.height / 2 - borderWidth)}px`;
    styles.popper.left = `${isRight ? triggerRect.right - borderWidth + 2 * arrowGap : triggerRect.left - contentRect.width + borderWidth - 2 * arrowGap}px`;
    styles.arrow.top = `${centerY - arrowRect.height / 2 + borderWidth}px`;
    styles.arrow.left = `${isRight ? triggerRect.right - borderWidth - arrowGap : triggerRect.left + borderWidth - arrowRect.width + arrowGap}px`;
  }

  styles.popper.visibility = "visible";
  styles.arrow.visibility = "visible";
};

const ns = useBem("popper");
const kls = computed(() => ({
  wrap: ns.b(),
  trigger: ns.e("trigger"),
  content: [ns.e("content"), ns.em("content", props.size), ns.em("content", props.mode)],
  arrow: [ns.e("arrow"), ns.em("arrow", props.size), ns.em("arrow", currentPlacement.value)],
}));
</script>

<template>
  <div
    ref="wrapRef"
    :class="kls.wrap"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
    @click="handleClick"
  >
    <span :class="kls.trigger">
      <slot name="default" />
    </span>
    <div
      v-if="isVisible && ($slots.content || props.content)"
      ref="contentRef"
      :class="kls.content"
      :style="styles.popper as CSSProperties"
      @click.stop
    >
      <slot v-if="$slots.content" name="content" />
      <template v-else>{{ useText(props.content) }}</template>
    </div>

    <div
      v-if="isVisible && ($slots.content || props.content)"
      ref="arrowRef"
      :class="kls.arrow"
      :style="styles.arrow as CSSProperties"
    />
  </div>
</template>
