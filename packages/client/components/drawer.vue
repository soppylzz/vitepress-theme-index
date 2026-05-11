<script setup lang="ts">
import { computed, ref, reactive, watch } from "vue";
import type { DrawerProps } from "../types";
import { useBem, useLockScroll } from "../composables";

const model = defineModel<boolean>({ default: false });
const props = withDefaults(defineProps<DrawerProps>(), {
  placement: "left",
  resizable: true,
  size: "medium",
});

const content = ref<HTMLElement | null>(null);
const state = reactive({
  isResizing: false,
  startPos: 0,
  startSize: 0,
});
const sizeLimit = reactive({
  min: 200,
  max: 800,
});

const isVertical = computed(() => ["top", "bottom"].includes(props.placement));
const isReversed = computed(() => !["top", "left"].includes(props.placement));

watch(model, (val) => {
  if (val && content.value) {
    readSizeFromStyle();
  }
});

function readSizeFromStyle() {
  if (!content.value) return;
  const style = getComputedStyle(content.value);

  if (isVertical.value) {
    sizeLimit.min = parseInt(style.minHeight) || 200;
    sizeLimit.max = parseInt(style.maxHeight) || 800;
  } else {
    sizeLimit.min = parseInt(style.minWidth) || 200;
    sizeLimit.max = parseInt(style.maxWidth) || 800;
  }
}

const attachListeners = () => {
  document.addEventListener("mousemove", handleMove);
  document.addEventListener("mouseup", stopResize);
  document.addEventListener("touchmove", handleMove, { passive: false });
  document.addEventListener("touchend", stopResize);
};

const detachListeners = () => {
  document.removeEventListener("mousemove", handleMove);
  document.removeEventListener("mouseup", stopResize);
  document.removeEventListener("touchmove", handleMove);
  document.removeEventListener("touchend", stopResize);
};

function getPosition(e: MouseEvent | TouchEvent) {
  const target = e instanceof TouchEvent ? e.touches[0] : e;
  return target[isVertical.value ? "clientY" : "clientX"];
}

function startResize(e: MouseEvent | TouchEvent) {
  if (!props.resizable) return;

  const startSize = isVertical.value ? content.value.offsetHeight : content.value.offsetWidth;

  Object.assign(state, {
    isResizing: true,
    startPos: getPosition(e),
    startSize,
  });

  attachListeners();
}

function stopResize() {
  if (!state.isResizing) return;
  state.isResizing = false;
  detachListeners();
}

function handleMove(e: MouseEvent | TouchEvent) {
  if (!state.isResizing || !content.value) return;

  const delta = getPosition(e) - state.startPos;
  const newSize = Math.max(
    sizeLimit.min,
    Math.min(sizeLimit.max, state.startSize + (isReversed.value ? -delta : delta))
  );

  const sizeKey = isVertical.value ? "height" : "width";
  content.value.style[sizeKey] = `${newSize}px`;
  e.preventDefault();
}

useLockScroll(model, document.body, stopResize);

const ns = useBem("drawer");
const kls = computed(() => ({
  wrap: [ns.b(), ns.m(props.placement), ns.m(props.size), ns.when("resize", state.isResizing)],
  content: [ns.e("content"), ns.em("content", props.placement)],
  dragger: [
    ns.e("dragger"),
    ns.em("dragger", props.placement),
    ns.when("resize", state.isResizing),
  ],
  overlay: ns.e("overlay"),
}));
</script>

<template>
  <div v-if="model" :class="kls.wrap">
    <div ref="content" :class="kls.content">
      <slot />
    </div>
    <div
      v-if="props.resizable"
      :class="kls.dragger"
      @mousedown.prevent="startResize"
      @touchstart.prevent="startResize"
    >
      <!--  drawer  -->
    </div>
    <div :class="kls.overlay" @click="model = false">
      <!--  overlay  -->
    </div>
  </div>
</template>
