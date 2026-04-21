import type { CSSProperties, PropType } from "vue";
import {
  nextTick,
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import { ensureArray } from "@vitepress-theme-index/shared";
import type { IndexDirection, IndexSize } from "../types";
import { useBem } from "../composables";

export type WheelPickerAnimationState =
  | "idle"
  | "dragging"
  | "inertia"
  | "snapping"
  | "click"
  | "scroll";

const DECELERATION = 0.003;
const VELOCITY_THRESHOLD = 0.5;
const SNAP_ANIMATION_DURATION = 200;
const ITEM_TRANSFORM = {
  maxScale: 1,
  minScale: 0.7,
  maxOffsetRatio: 0.5,
};
const EASE = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

// TODO: fix offset bug
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
      validator: (val: number) => val > 0,
    },
    modelValue: {
      type: Number,
      default: 0,
    },
    size: {
      type: String as PropType<IndexSize>,
      default: "medium",
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const itemRefs = ref<(HTMLElement | null)[]>([]);
    const itemSizes = shallowRef<Map<number, [number, number]>>(new Map());
    const contentRef = shallowRef<HTMLElement | null>(null);

    const animationState = ref<WheelPickerAnimationState>("idle");
    const offset = ref(0);
    const velocity = ref(0);
    const lastPointerPos = ref(0);
    const rafId = ref<number | null>(null);
    const wheelDeltaAccumulator = ref(0);

    const isVertical = computed(() => props.direction === "col");
    const shouldLoop = computed(() => props.loop && props.list.length > 1);

    const renderList = computed(() => {
      return shouldLoop.value ? [...props.list, ...props.list, ...props.list] : props.list;
    });

    const renderSize = ref(0);
    const realSize = ref(0);

    const wrapperSize = computed(() => {
      const len = props.list.length;
      if (itemSizes.value.size === 0 || len === 0) return 0;

      const sizeList: number[] = [];
      for (let i = 0; i < len; i++) {
        const size = itemSizes.value.get(i)[0];
        if (size === undefined) return 0;
        sizeList.push(size);
      }

      const count = Math.max(3, Math.min(props.show, len));

      let maxSum = sizeList.slice(0, count).reduce((a, b) => a + b, 0);
      let currentSum = maxSum;

      for (let i = count; i < sizeList.length; i++) {
        currentSum = currentSum - sizeList[i - count] + sizeList[i];
        maxSum = Math.max(maxSum, currentSum);
      }
      return maxSum;
    });

    const normalizeOffset = (value: number): number => {
      if (!shouldLoop.value) {
        const min = -wrapperSize.value / 2;
        const max = renderSize.value - wrapperSize.value / 2;
        return Math.max(min, Math.min(max, value));
      }

      const single = realSize.value;
      if (!single) return value;

      const lower = single;
      const upper = single * 2;
      const range = upper - lower;

      let normalized = value - lower;
      normalized = normalized % range;
      if (normalized < 0) normalized += range;
      return normalized + lower;
    };

    const setOffset = (value: number) => {
      offset.value = normalizeOffset(value);
    };

    const getNearestIndex = (): number => {
      const items = itemRefs.value;
      if (items.length === 0) return 0;

      const wrapperCenter = offset.value + wrapperSize.value / 2;
      let closest = 0;
      let minDist = Infinity;

      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        if (!el) continue;

        const itemCenter = isVertical.value
          ? el.offsetTop + el.offsetHeight / 2
          : el.offsetLeft + el.offsetWidth / 2;

        const dist = Math.abs(itemCenter - wrapperCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      }
      return closest;
    };

    const calculateOffsetToCenter = (index: number): number => {
      const items = itemRefs.value;
      const el = items[index];
      if (!el) return 0;

      const itemCenter = isVertical.value
        ? el.offsetTop + el.offsetHeight / 2
        : el.offsetLeft + el.offsetWidth / 2;

      const wrapperCenter = wrapperSize.value / 2;
      return itemCenter - wrapperCenter;
    };

    const resetAnimation = () => {
      if (rafId.value !== null) {
        cancelAnimationFrame(rafId.value);
        rafId.value = null;
      }
    };

    const snapToIndex = (targetIndex: number) => {
      resetAnimation();
      animationState.value = "snapping";

      const startOffset = offset.value;
      const targetOffset = calculateOffsetToCenter(targetIndex);
      const startTime = performance.now();

      const animate = (now: number) => {
        const progress = Math.min((now - startTime) / SNAP_ANIMATION_DURATION, 1);
        setOffset(startOffset + (targetOffset - startOffset) * EASE(progress));

        if (progress < 1) {
          rafId.value = requestAnimationFrame(animate);
        } else {
          setOffset(targetOffset);
          animationState.value = "idle";
          emit("update:modelValue", targetIndex % props.list.length);
        }
      };

      rafId.value = requestAnimationFrame(animate);
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!["idle", "snapping", "inertia", "scroll"].includes(animationState.value)) return;

      resetAnimation();
      animationState.value = "dragging";

      const evt = "touches" in e ? e.touches[0] : e;
      lastPointerPos.value = isVertical.value ? evt.clientY : evt.clientX;
      velocity.value = 0;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (animationState.value !== "dragging") return;
      e.preventDefault();

      const evt = "touches" in e ? e.touches[0] : e;
      const current = isVertical.value ? evt.clientY : evt.clientX;
      const delta = lastPointerPos.value - current;

      setOffset(offset.value + delta);
      velocity.value = delta;
      lastPointerPos.value = current;
    };

    const handlePointerUp = () => {
      if (animationState.value !== "dragging") return;
      if (Math.abs(velocity.value) < VELOCITY_THRESHOLD) {
        animationState.value = "idle";
        return;
      }

      resetAnimation();
      animationState.value = "inertia";
      const inertiaLoop = () => {
        velocity.value *= 1 - DECELERATION;
        setOffset(offset.value + velocity.value);

        if (Math.abs(velocity.value) > VELOCITY_THRESHOLD) {
          rafId.value = requestAnimationFrame(inertiaLoop);
        } else {
          snapToIndex(getNearestIndex());
        }
      };
      rafId.value = requestAnimationFrame(inertiaLoop);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (animationState.value !== "scroll") {
        resetAnimation();
        animationState.value = "scroll";
      }

      const delta = isVertical.value ? e.deltaY : e.deltaX;
      const windowDim = isVertical.value ? window.innerHeight : window.innerWidth;
      const scale = wrapperSize.value / windowDim;
      wheelDeltaAccumulator.value += delta * scale;

      const smoothScroll = () => {
        const step = wheelDeltaAccumulator.value * 0.2;
        wheelDeltaAccumulator.value -= step;
        setOffset(offset.value + step);

        if (Math.abs(wheelDeltaAccumulator.value) > 0.1) {
          rafId.value = requestAnimationFrame(smoothScroll);
        } else {
          wheelDeltaAccumulator.value = 0;
          snapToIndex(getNearestIndex());
        }
      };
      rafId.value = requestAnimationFrame(smoothScroll);
    };

    const handleItemClick = (index: number) => {
      resetAnimation();
      animationState.value = "click";
      snapToIndex(index);
    };

    let resizeObserver: ResizeObserver | null = null;

    watch(
      [() => props.modelValue, () => props.list],
      ([val]) => {
        if (animationState.value !== "idle" || !wrapperSize.value) return;
        setOffset(calculateOffsetToCenter(val));
      },
      { flush: "post", immediate: true }
    );

    onMounted(() => {
      resizeObserver = new ResizeObserver((entries) => {
        const newSizes = new Map(itemSizes.value);
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const indexStr = target.dataset.index;
          if (!indexStr) return;

          const renderIndex = parseInt(indexStr, 10);
          const originalIndex = renderIndex % props.list.length;
          const box = ensureArray(entry.borderBoxSize)[0];
          const primary = isVertical.value ? box.blockSize : box.inlineSize;
          const secondary = isVertical.value ? box.inlineSize : box.blockSize;
          newSizes.set(originalIndex, [primary, secondary]);
        });
        itemSizes.value = newSizes;

        if (!contentRef.value) return;
        renderSize.value = contentRef.value[isVertical.value ? "offsetHeight" : "offsetWidth"];
        realSize.value = shouldLoop.value ? renderSize.value / 3 : renderSize.value;
      });

      itemRefs.value.forEach((el) => el && resizeObserver.observe(el));
      resizeObserver.observe(contentRef.value);

      snapToIndex(props.modelValue);
    });

    onBeforeUnmount(() => {
      resizeObserver.disconnect();
      resetAnimation();
    });

    const getItemStyle = (index: number): CSSProperties => {
      const el = itemRefs.value[index];
      if (!el || wrapperSize.value === 0) return {};

      let itemCenter = isVertical.value
        ? el.offsetTop + el.offsetHeight / 2
        : el.offsetLeft + el.offsetWidth / 2;

      const pickerCenter = offset.value + wrapperSize.value / 2;

      if (shouldLoop.value) {
        const single = realSize.value;
        if (single > 0) {
          const candidates = [itemCenter - single, itemCenter, itemCenter + single];
          let minDist = Infinity;
          let bestCandidate = itemCenter;
          for (const c of candidates) {
            const dist = Math.abs(c - pickerCenter);
            if (dist < minDist) {
              minDist = dist;
              bestCandidate = c;
            }
          }
          itemCenter = bestCandidate;
        }
      }

      const diff = itemCenter - pickerCenter;
      const ratio = Math.abs(diff) / (wrapperSize.value * ITEM_TRANSFORM.maxOffsetRatio);
      const scale = Math.max(
        ITEM_TRANSFORM.minScale,
        ITEM_TRANSFORM.maxScale - ratio * (ITEM_TRANSFORM.maxScale - ITEM_TRANSFORM.minScale)
      );
      const translate = diff * 0.1;

      return {
        transform: isVertical.value
          ? `scale(${scale}) translate3d(0, ${translate}px, 0)`
          : `scale(${scale}) translate3d(${translate}px, 0, 0)`,
      };
    };

    const ns = useBem("wheel-picker");

    return () => {
      const kls = {
        wrap: [ns.b(), ns.m(props.size), ns.m(props.direction)],
        content: [ns.e("content"), ns.em("content", props.direction)],
        indicator: [ns.e("indicator"), ns.em("indicator", props.size)],
        item: [ns.e("item"), ns.em("item", props.size)],
      };
      const [primary, secondary] = itemSizes.value.get(props.modelValue) || [0, 0];

      const pickerStyle: CSSProperties = {
        [isVertical.value ? "height" : "width"]: `${wrapperSize.value}px`,
      };

      const contentStyle: CSSProperties = {
        transform: isVertical.value
          ? `translate3d(0, ${-offset.value}px, 0)`
          : `translate3d(${-offset.value}px, 0, 0)`,
      };

      const indicatorStyle: CSSProperties = {
        [isVertical.value ? "height" : "width"]: `${primary}px`,
        [isVertical.value ? "width" : "height"]: `${secondary}px`,
      };

      return (
        <div
          class={kls.wrap}
          style={pickerStyle}
          onMousedown={handlePointerDown}
          onMousemove={handlePointerMove}
          onMouseup={handlePointerUp}
          onMouseleave={handlePointerUp}
          onTouchstart={handlePointerDown}
          onTouchmove={handlePointerMove}
          onTouchend={handlePointerUp}
          onWheel={handleWheel}
        >
          <div ref={contentRef} style={contentStyle} class={kls.content}>
            {renderList.value.map((item, index) => (
              <div
                key={index}
                class={kls.item}
                data-index={index}
                ref={(el) => (itemRefs.value[index] = el)}
                onClick={() => handleItemClick(index)}
                style={getItemStyle(index)}
              >
                {item}
              </div>
            ))}
          </div>
          <div style={indicatorStyle} class={kls.indicator} />
        </div>
      );
    };
  },
});

export { VtiWheelPicker };
