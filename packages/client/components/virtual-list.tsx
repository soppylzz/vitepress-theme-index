import type { CSSProperties, PropType, VNode } from "vue";
import {
  computed,
  defineComponent,
  Fragment,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
} from "vue";
import { createNumValidator } from "../utils";
import { debounce } from "lodash-unified";
import type { IndexDirection } from "../types";
import { ensureArray } from "@vitepress-theme-index/shared";

function flattenVNodes(nodes: VNode[] | undefined): VNode[] {
  if (!nodes) return [];
  const result: VNode[] = [];
  nodes.forEach((node) => {
    if (node.type === Fragment) {
      result.push(...flattenVNodes(node.children as VNode[]));
    } else if (node.type !== Comment) {
      result.push(node);
    }
  });
  return result;
}

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
    adsorb: {
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
    const isAdsorbing = ref(false);

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
        containerRef.value[isVertical.value ? "clientHeight" : "clientWidth"] || props.boxSize || 0
      );
    }

    let animationFrameId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let containerResizeObserver: ResizeObserver | null = null;

    const adsorb = debounce(() => {
      if (!containerRef.value || !wrapperRef.value) return;

      let targetOffset: number;
      const viewportSize = getViewportSize();
      const scrollPos = getScrollPosition();

      function animateScrollTo(from: number, to: number, duration = 300) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }

        isAdsorbing.value = true;
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
            isAdsorbing.value = false;
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

      if (props.adsorb && !isAdsorbing.value) {
        adsorb();
      }
    }

    onMounted(() => {
      if (!containerRef.value || !wrapperRef.value) return;

      resizeObserver = new ResizeObserver((entries) => {
        if (isAdsorbing.value) return;

        if (props.autoSize) {
          entries.forEach((entry) => {
            if (entry.target instanceof HTMLElement) {
              const indexStr = entry.target.dataset["index"];
              if (!indexStr) return;
              const index = parseInt(indexStr, 10);

              const box = ensureArray(entry.borderBoxSize)[0];
              const size = box[isVertical.value ? "blockSize" : "inlineSize"];
              if (size > 0) {
                updateItemSize(index, size);
              }
            }
          });
        }

        calculateRenderRange();
      });

      mutationObserver = new MutationObserver((mutations) => {
        if (isAdsorbing.value) return;

        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement && node.hasAttribute("data-virtual-item")) {
                resizeObserver.observe(node);
              }
            });

            mutation.removedNodes.forEach((node) => {
              if (node instanceof HTMLElement && node.hasAttribute("data-virtual-item")) {
                const indexStr = node.dataset.index;
                if (!indexStr) return;
                const index = parseInt(indexStr, 10);

                resizeObserver.unobserve(node);
                if (props.autoSize) {
                  deleteItemSize(index);
                }
              }
            });
          }
        });
      });

      containerResizeObserver = new ResizeObserver(() => {
        if (isAdsorbing.value) return;
        calculateRenderRange();
      });

      containerResizeObserver?.observe?.(containerRef.value);
      mutationObserver?.observe?.(wrapperRef.value, {
        childList: true,
        subtree: false,
      });
    });

    onBeforeUnmount(() => {
      resizeObserver?.disconnect?.();
      mutationObserver?.disconnect?.();
      containerResizeObserver?.disconnect?.();
      adsorb.cancel();
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    });

    return () => {
      const vertical = isVertical.value;
      const { start, end } = renderRange;
      const renderItems = items.value.slice(start, end + 1);

      const ctnStyl: CSSProperties = {
        position: "relative",
        [vertical ? "width" : "height"]: "100%",
        [vertical ? "height" : "width"]: props.boxSize ? `${props.boxSize}` : "100%",
        [vertical ? "overflowY" : "overflowX"]: "auto",
      };

      const wrapStyl: CSSProperties = {
        position: "relative",
        [vertical ? "height" : "width"]: `${totalSize.value}px`,
        [vertical ? "width" : "height"]: "100%",
      };

      return (
        <div ref={containerRef} style={ctnStyl} onScroll={calculateRenderRange}>
          <div ref={wrapperRef} style={wrapStyl}>
            {renderItems.map((vnode, i) => {
              const actualIndex = start + i;
              const offset = getOffsetFromIndex(actualIndex);
              const itemSize = getItemSize(actualIndex);

              const itemStyl: CSSProperties = {
                position: "absolute",
                willChange: "transform",
                [vertical ? "width" : "height"]: "100%",
                [vertical ? "height" : "width"]: props.autoSize ? "auto" : `${itemSize}px`,
                transform: vertical
                  ? `translate3d(0, ${offset}px, 0)`
                  : `translate3d(${offset}px, 0, 0)`,
              };

              return (
                <div
                  key={actualIndex}
                  style={itemStyl}
                  data-index={actualIndex}
                  data-virtual-item=""
                >
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
