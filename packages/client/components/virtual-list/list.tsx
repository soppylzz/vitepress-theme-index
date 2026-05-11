import type { CSSProperties, PropType } from "vue";
import {
  computed,
  ref,
  reactive,
  onMounted,
  shallowRef,
  defineComponent,
  onBeforeUnmount,
} from "vue";
import { debounce } from "lodash-unified";
import { createNumValidator, flattenVNodes } from "../../utils";
import type { IndexDirection } from "../../types";

const VtiVirtualList = defineComponent({
  name: "VtiVirtualList",
  props: {
    direction: {
      type: String as PropType<IndexDirection>,
      default: "col",
    },
    buffer: {
      type: Number,
      default: 5,
      validator: createNumValidator("non-negative"),
    },
    autoSize: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      default: 50,
      validator: createNumValidator("positive"),
    },
    boxSize: {
      type: Number,
    },
    snap: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const containerRef = shallowRef<HTMLElement | null>(null);
    const wrapperRef = shallowRef<HTMLElement | null>(null);

    const visibleRange = reactive({ start: 0, end: 0 });
    const renderRange = reactive({ start: 0, end: 0 });

    const direction = ref<"forward" | "backward">("backward");
    const lastScrollPos = ref(0);
    const isSnapping = ref(false);

    // for autoSize:true, using `shallowRef` collect dependencies
    const itemSizes = shallowRef<Map<number, number>>(new Map());
    const isVertical = computed(() => props.direction === "col");
    const items = computed(() => flattenVNodes(slots.default?.()));
    const itemCount = computed(() => items.value.length);

    const averageSize = computed(() => {
      const sizeMap = itemSizes.value;
      if (!sizeMap || sizeMap.size === 0) return props.size;
      let sum = 0;
      sizeMap.forEach((val) => (sum += val));
      return sum / sizeMap.size;
    });

    const totalSize = computed(() => {
      if (props.autoSize) {
        let total = 0;
        for (let i = 0; i < itemCount.value; i++) {
          total += itemSizes.value.get(i) ?? averageSize.value;
        }
        return total;
      } else {
        return itemCount.value * props.size;
      }
    });

    function getScrollPosition() {
      if (!containerRef.value) return 0;
      return containerRef.value[isVertical.value ? "scrollTop" : "scrollLeft"];
    }

    function getViewportSize() {
      if (!containerRef.value) return 0;
      return (
        containerRef.value[isVertical.value ? "offsetHeight" : "offsetWidth"] || props.boxSize || 0
      );
    }

    let animationFrameId: number | null = null;
    let containerResizeObserver: ResizeObserver | null = null;

    const snap = debounce(() => {
      if (!containerRef.value || !wrapperRef.value) return;

      let targetOffset: number;
      const viewportSize = getViewportSize();
      const scrollPos = getScrollPosition();

      function animateScrollTo(from: number, to: number, duration = 300) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }

        isSnapping.value = true;
        const startTime = Date.now();
        const container = containerRef.value;
        if (!container) return;

        function step() {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          const easeProgress = 1 - (1 - progress) * (1 - progress);
          const current = from + (to - from) * easeProgress;

          if (containerRef.value) {
            containerRef.value[isVertical.value ? "scrollTop" : "scrollLeft"] = current;
          }

          if (progress < 1) {
            animationFrameId = requestAnimationFrame(step);
          } else {
            animationFrameId = null;
            isSnapping.value = false;
          }
        }

        animationFrameId = requestAnimationFrame(step);
      }

      if (direction.value === "backward") {
        targetOffset = getOffsetFromIndex(visibleRange.start);
      } else {
        const endItemOffset = getOffsetFromIndex(visibleRange.end);
        const endItemSize = getItemSize(visibleRange.end);

        targetOffset = Math.max(0, endItemOffset + endItemSize - viewportSize);
      }

      if (scrollPos != targetOffset) {
        animateScrollTo(scrollPos, targetOffset);
      }
    }, 150);

    function getItemSize(index: number): number {
      if (!props.autoSize) return props.size;
      return itemSizes.value.get(index) ?? averageSize.value;
    }

    function getOffsetFromIndex(index: number) {
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += getItemSize(i);
      }
      return offset;
    }

    function getIndexFromOffset(offset: number) {
      const vnodes = flattenVNodes(slots.default?.());
      let currentOffset = 0;

      for (let i = 0; i < vnodes.length; i++) {
        const itemSize = getItemSize(i);
        if (currentOffset + itemSize > offset) {
          return i;
        }
        currentOffset += itemSize;
      }

      return Math.max(0, vnodes.length - 1);
    }

    function calculateRenderRange() {
      if (!containerRef.value) return;

      const viewportSize = getViewportSize();
      const scrollPos = getScrollPosition();

      if (scrollPos > lastScrollPos.value) {
        direction.value = "forward";
      } else if (scrollPos < lastScrollPos.value) {
        direction.value = "backward";
      }
      lastScrollPos.value = scrollPos;

      const startIndex = getIndexFromOffset(scrollPos);
      const endIndex = getIndexFromOffset(scrollPos + viewportSize);

      const bufferStart = Math.max(0, startIndex - props.buffer);
      const bufferEnd = Math.min(itemCount.value - 1, endIndex + props.buffer);

      visibleRange.start = startIndex;
      visibleRange.end = endIndex;
      renderRange.start = bufferStart;
      renderRange.end = bufferEnd;

      if (props.snap && !isSnapping.value) {
        snap();
      }
    }

    function updateItemSize(index: number, size: number) {
      const sizeMap = itemSizes.value;
      if (sizeMap.get(index) !== size) {
        const newMap = new Map(sizeMap);
        newMap.set(index, size);
        itemSizes.value = newMap;
      }
    }

    function deleteItemSize(index: number) {
      const sizeMap = itemSizes.value;
      if (sizeMap.has(index)) {
        const newMap = new Map(sizeMap);
        newMap.delete(index);
        itemSizes.value = newMap;
      }
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (isSnapping.value) return;

      if (props.autoSize) {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const indexStr = target.dataset.index;
          const index = parseInt(indexStr, 10);

          const size = target[isVertical.value ? "offsetHeight" : "offsetWidth"];
          updateItemSize(index, size);
        });
      }

      calculateRenderRange();
    });

    const mutationObserver = new MutationObserver((mutations) => {
      if (isSnapping.value) return;

      mutations.forEach((mutation) => {
        if (mutation.type !== "childList") return;

        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.hasAttribute("data-index")) {
            resizeObserver.observe(node);
          }
        });

        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.hasAttribute("data-index")) {
            const indexStr = node.dataset.index;
            const index = parseInt(indexStr, 10);

            resizeObserver.unobserve(node);
            if (props.autoSize) {
              deleteItemSize(index);
            }
          }
        });
      });
    });

    onMounted(() => {
      if (!containerRef.value || !wrapperRef.value) return;

      containerResizeObserver = new ResizeObserver(() => {
        if (isSnapping.value) return;
        calculateRenderRange();
      });

      containerResizeObserver?.observe?.(containerRef.value);
      mutationObserver.observe(wrapperRef.value, {
        childList: true,
        subtree: false,
      });
    });

    onBeforeUnmount(() => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      containerResizeObserver.disconnect();
      snap.cancel();
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    });

    function getItemStyl(index: number): CSSProperties {
      const offset = getOffsetFromIndex(index);
      const itemSize = getItemSize(index);
      return {
        position: "absolute",
        willChange: "transform",
        [isVertical.value ? "width" : "height"]: "100%",
        [isVertical.value ? "height" : "width"]: props.autoSize ? "auto" : `${itemSize}px`,
        transform: isVertical.value
          ? `translate3d(0, ${offset}px, 0)`
          : `translate3d(${offset}px, 0, 0)`,
      };
    }

    return () => {
      const { start, end } = renderRange;
      const renderItems = items.value.slice(start, end + 1);

      const listStyl: CSSProperties = {
        position: "relative",
        [isVertical.value ? "width" : "height"]: "100%",
        [isVertical.value ? "height" : "width"]: props.boxSize ? `${props.boxSize}` : "100%",
        [isVertical.value ? "overflowY" : "overflowX"]: "auto",
      };

      const ctnStyl: CSSProperties = {
        position: "relative",
        [isVertical.value ? "height" : "width"]: `${totalSize.value}px`,
        [isVertical.value ? "width" : "height"]: "100%",
      };

      return (
        <div ref={containerRef} style={listStyl} onScroll={calculateRenderRange}>
          <div ref={wrapperRef} style={ctnStyl}>
            {renderItems.map((vnode, i) => {
              const actualIndex = start + i;
              return (
                <div key={actualIndex} style={getItemStyl(actualIndex)} data-index={actualIndex}>
                  {vnode}
                </div>
              );
            })}
          </div>
        </div>
      );
    };
  },
});

export { VtiVirtualList };
