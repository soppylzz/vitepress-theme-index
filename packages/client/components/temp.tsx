import type { CSSProperties, PropType } from "vue";
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import type { IndexDirection } from "../types";
import { debounce, isFunction } from "lodash-unified";
import { ensureArray } from "@vitepress-theme-index/shared";

const DECELERATION = 0.003;
const VELOCITY_THRESHOLD = 0.5;
const SNAP_ANIMATION_DURATION = 300;
const SNAP_DEBOUNCE_DELAY = 100;
const EASE_QUAD_COEFFICIENT = 0.5;

const VtiWheelPicker = defineComponent({
  name: "VtiWheelPicker",
  props: {
    list: {
      type: Array as PropType<any[]>,
      required: true,
    },
    direction: {
      type: String as PropType<IndexDirection>,
      default: "col",
    },
    loop: {
      type: Boolean,
      default: false,
    },
    show: {
      type: Number,
      default: 3,
    },
    modelValue: {
      type: Number,
      default: 0,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    let animationFrameId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const velocity = ref(0);
    const lastPosition = ref(0);
    const animationState = ref<"idle" | "dragging" | "inertia" | "snapping" | "scrolling">("idle");
    const wrapperTotalSize = ref(0);

    const itemSizes = shallowRef<Map<number, number>>(new Map<number, number>());

    const wrapperRef = shallowRef<HTMLElement | null>(null);
    const containerRef = shallowRef<HTMLElement | null>(null);
    const itemRefs = shallowRef<HTMLElement[]>([]);

    const isVertical = computed(() => props.direction === "col");
    const shouldLoop = computed(() => props.loop && props.list.length > 1);

    const baseLength = computed(() => props.list.length);
    const showSize = computed(() => Math.max(Math.min(baseLength.value, props.show), 3));
    const boxSize = computed(() => {
      return wrapperTotalSize.value > 0 ? wrapperTotalSize.value / showSize.value : 0;
    });

    const renderList = computed<[number, any][]>(() => {
      const list = props.list;
      const len = list.length;
      return shouldLoop.value
        ? Array.from({ length: len * 3 }, (_, i) => {
            return [i, list[i % len]];
          })
        : list.map((item, i) => [i, item]);
    });

    function normalizeOffset(off: number): number {
      if (wrapperTotalSize.value === 0 || boxSize.value === 0) {
        return 0;
      }

      if (!shouldLoop.value) {
        const min = 0;
        const max = wrapperTotalSize.value - boxSize.value;
        return Math.max(min, Math.min(off, max));
      }

      const total = wrapperTotalSize.value;
      const size = boxSize.value;
      const scrollRange = total - size;

      if (scrollRange <= 0) return 0;

      let clamped = off;
      while (clamped > scrollRange) clamped -= scrollRange;
      while (clamped < 0) clamped += scrollRange;
      return clamped;
    }

    const rawOffset = ref(0);
    const offset = computed({
      get: () => rawOffset.value,
      set: (value: number) => {
        rawOffset.value = value;
        if (animationState.value !== "scrolling" && containerRef.value) {
          containerRef.value[isVertical.value ? "scrollTop" : "scrollLeft"] = value;
        }
      },
    });

    function findNearestIndex(): number {
      const items = itemRefs.value;
      const len = items.length;
      if (!len) return 0;

      const containerCenter = offset.value + boxSize.value / 2;

      let closestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < len; i++) {
        const el = items[i];
        if (!el) continue;

        const size = itemSizes.value.get(i) || 0;

        const itemOffset = isVertical.value ? el.offsetTop : el.offsetLeft;
        const itemCenter = itemOffset + size / 2;

        const distance = Math.abs(containerCenter - itemCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
      return closestIndex;
    }

    function getCenterOffsetByIndex(index: number): number {
      const el = itemRefs.value[index];
      if (!el) return 0;

      const size = itemSizes.value.get(index) || 0;

      const itemOffset = isVertical.value ? el.offsetTop : el.offsetLeft;
      return itemOffset - (boxSize.value - size) / 2;
    }

    const snapToIndexItem = debounce(function snapToItemByIndexImpl(index: number) {
      animationState.value = "snapping";

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      offset.value = normalizeOffset(offset.value);

      const targetOffset = getCenterOffsetByIndex(index);
      const startOffset = offset.value;

      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / SNAP_ANIMATION_DURATION, 1);
        const easeProgress =
          progress < EASE_QUAD_COEFFICIENT
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
          offset.value = normalizeOffset(startOffset + (targetOffset - startOffset) * easeProgress);
        } else {
          offset.value = normalizeOffset(targetOffset);
          animationState.value = "idle";
          if (props.modelValue !== index % baseLength.value) {
            emit("update:modelValue", index % baseLength.value);
          }
        }
      };
      animationFrameId = requestAnimationFrame(animate);
    }, SNAP_DEBOUNCE_DELAY);

    function handleDragDown(e: MouseEvent | TouchEvent) {
      if (animationState.value !== "idle") return;

      const evt = e instanceof MouseEvent ? e : e.touches[0];
      lastPosition.value = evt[isVertical.value ? "clientY" : "clientX"];
      velocity.value = 0;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      animationState.value = "dragging";
    }

    function handleDragMove(e: MouseEvent | TouchEvent) {
      if (animationState.value !== "dragging") return;

      const evt = e instanceof MouseEvent ? e : e.touches[0];
      const position = evt[isVertical.value ? "clientY" : "clientX"];
      const delta = lastPosition.value - position;
      offset.value = normalizeOffset(offset.value + delta);
      velocity.value = delta;
      lastPosition.value = position;
    }

    function handleDragEnd() {
      if (animationState.value !== "dragging") return;

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      animationState.value = "inertia";

      const animate = () => {
        velocity.value *= 1 - DECELERATION;
        offset.value = normalizeOffset(offset.value + velocity.value);

        if (Math.abs(velocity.value) < VELOCITY_THRESHOLD) {
          const targetIndex = findNearestIndex();
          snapToIndexItem(targetIndex);
        } else {
          animationFrameId = requestAnimationFrame(animate);
        }
      };
      animationFrameId = requestAnimationFrame(animate);
    }

    function handleScroll(): void {
      if (!["idle", "scrolling"].includes(animationState.value)) return;
      animationState.value = "scrolling";
      const targetIndex = findNearestIndex();
      snapToIndexItem(targetIndex);
    }

    onMounted(() => {
      resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target instanceof HTMLElement) {
            const indexStr = entry.target.dataset["index"];
            if (!indexStr) return;
            const index = parseInt(indexStr, 10);

            // size before transform and scale
            const box = ensureArray(entry.borderBoxSize)[0];
            const size = box[isVertical.value ? "blockSize" : "inlineSize"];

            const newSizes = new Map(itemSizes.value);
            newSizes.set(index, size);
            itemSizes.value = newSizes;
          }
        });

        if (wrapperRef.value) {
          const rect = wrapperRef.value.getBoundingClientRect();
          wrapperTotalSize.value = isVertical.value ? rect.height : rect.width;
        }
      });

      if (wrapperRef.value) {
        wrapperRef.value.querySelectorAll("[data-picker-item]").forEach((item, idx) => {
          itemRefs.value[idx] = item as HTMLElement;
          resizeObserver!.observe(item);
        });
      }
    });

    onBeforeUnmount(() => {
      resizeObserver?.disconnect?.();
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    });

    return () => {
      const vertical = isVertical.value;
      const currentSize = itemSizes.value.get(props.modelValue);

      const ctnStyl: CSSProperties = {
        position: "relative",
        userSelect: "none",
        [vertical ? "overflowY" : "overflowX"]: "auto",
        [vertical ? "height" : "width"]: `${boxSize.value}px`,
        [vertical ? "width" : "height"]: "100%",
      };

      const phantomStyl: CSSProperties = {
        [vertical ? "height" : "width"]: `${wrapperTotalSize.value}px`,
      };

      const wrapStyl: CSSProperties = {
        position: "absolute",
        display: "flex",
        alignItems: "center",
        flexDirection: vertical ? "column" : "row",
      };

      const indicatorStyl: CSSProperties = {
        position: "absolute",
        [vertical ? "height" : "width"]: `${currentSize}px`,
        [vertical ? "width" : "height"]: "100%",
        backgroundColor: "rgba(100, 100, 100, 0.5)",
      };

      return (
        <div
          ref={containerRef}
          style={ctnStyl}
          onMousedown={handleDragDown}
          onMousemove={handleDragMove}
          onMouseleave={handleDragEnd}
          onMouseup={handleDragEnd}
          onTouchstart={handleDragDown}
          onTouchmove={handleDragMove}
          onTouchend={handleDragEnd}
          onScroll={handleScroll}
        >
          <div ref={wrapperRef} style={wrapStyl}>
            {renderList.value.map(([i, item]) => {
              return (
                <div key={i} data-index={i} data-picker-item="">
                  {String(item)}
                </div>
              );
            })}
          </div>
          <div style={phantomStyl}>{/* phantom wrapper */}</div>
          {/*<div style={indicatorStyl}></div>*/}
        </div>
      );
    };
  },
});

export { VtiWheelPicker };
