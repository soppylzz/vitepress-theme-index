<script setup lang="ts">
import type { DrawerEmits, DrawerProps } from "../types";
import { useBem } from "../composables";
import { computed, ref, onUnmounted } from "vue";

const emits = defineEmits<DrawerEmits>();
const model = defineModel<boolean>({ default: false });
const props = withDefaults(defineProps<DrawerProps>(), {
  placement: "left",
  resizable: false,
  size: "medium",
});

// DOM refs
const content = ref<HTMLElement | null>(null);

// Resize state
const resizeState = ref({ isResizing: false, startPos: 0, startSize: 0 });

// Layout flags
const isVertical = computed(() => ["top", "bottom"].includes(props.placement));
const posKey = computed<"clientX" | "clientY">(() => (isVertical.value ? "clientY" : "clientX"));
const sizeKey = computed<"width" | "height">(() => (isVertical.value ? "height" : "width"));

// Get position from mouse/touch event
const getPos = (e: MouseEvent | TouchEvent): number => {
  const target = e instanceof TouchEvent ? e.touches[0] : (e as MouseEvent);
  return target[posKey.value];
};

// Get current drawer dimension
const getSize = (): number => {
  if (!content.value) return 350;
  return isVertical.value ? content.value.offsetHeight : content.value.offsetWidth;
};

// Close on overlay click
const handleOverlayClick = (e: MouseEvent) => {
  if (!content.value?.contains(e.target as Node)) {
    emits("close");
    model.value = false;
  }
};

// Cleanup resize listeners
const detachListeners = () => {
  document.removeEventListener("mousemove", handleMove);
  document.removeEventListener("mouseup", stopResize);
  document.removeEventListener("touchmove", handleMove);
  document.removeEventListener("touchend", stopResize);
};

// End resize and cleanup
const stopResize = () => {
  if (!resizeState.value.isResizing) return;
  resizeState.value.isResizing = false;
  detachListeners();
};

// Move handler during resize
const handleMove = (e: MouseEvent | TouchEvent) => {
  const { isResizing, startPos, startSize } = resizeState.value;
  if (!isResizing || !content.value) return;

  const delta = getPos(e) - startPos;
  const isReversed = ["right", "bottom"].includes(props.placement);
  const newSize = Math.max(200, Math.min(800, startSize + (isReversed ? -delta : delta)));

  content.value.style[sizeKey.value] = `${newSize}px`;
};

// Start resize
const startResize = (e: MouseEvent | TouchEvent) => {
  if (!props.resizable) return;

  resizeState.value = {
    isResizing: true,
    startPos: getPos(e),
    startSize: getSize(),
  };

  document.addEventListener("mousemove", handleMove);
  document.addEventListener("mouseup", stopResize);
  document.addEventListener("touchmove", handleMove);
  document.addEventListener("touchend", stopResize);

  e.preventDefault();
};

// Cleanup on unmount
onUnmounted(() => {
  if (resizeState.value.isResizing) {
    stopResize();
  }
});

// Class generation
const ns = useBem("drawer");
const classes = computed(() => ({
  root: [ns.b(), ns.when("active", model.value)],
  dragger: [
    ns.e("dragger"),
    ns.em("dragger", props.placement),
    ns.em("dragger", props.size),
    ns.when("resizable", props.resizable),
  ],
  content: [ns.e("content"), ns.em("content", props.placement), ns.em("content", props.size)],
}));
</script>

<template>
  <div v-show="model" :class="classes.root" @click="handleOverlayClick">
    <div
      v-if="resizable"
      :class="classes.dragger"
      @mousedown="startResize"
      @touchstart="startResize"
    />
    <div ref="content" :class="classes.content">
      <slot />
    </div>
  </div>
</template>
