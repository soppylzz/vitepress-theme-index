import {
  computed,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
  watchEffect,
} from "vue";
import type { PropType, CSSProperties } from "vue";
import type { IndexDirection, IndexSize } from "../../types";
import { isUndefined, sum } from "lodash-unified";
import { useBem } from "../../composables";
import {
  EASE,
  DURATION,
  DECELERATION,
  SMOOTH_STEP,
  SMOOTH_THRESHOLD,
  VELOCITY_THRESHOLD,
  MOVE_THRESHOLD,
} from "./const";
import { createNumValidator } from "../../utils";

type WheelPickerState = "idle" | "drag" | "inertia" | "snap" | "scroll";

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
      validator: createNumValidator("positive"),
    },
    modelValue: {
      type: Number,
      default: 0,
    },
    size: {
      type: String as PropType<IndexSize>,
      default: "medium",
    },
    debug: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const isVertical = computed(() => props.direction === "col");
    const isLoop = computed(() => props.loop && props.list.length > 1);

    const pickerRef = shallowRef<HTMLElement | null>(null);
    const itemRefs = ref<HTMLElement[]>([]);

    const itemSizes = ref<[number, number][]>([]);
    const itemPrefixes = computed(() => {
      const sizes = itemSizes.value;

      const prefixes = [0];
      for (let i = 0; i < sizes.length; i++) {
        prefixes[i + 1] = prefixes[i] + (sizes[i][0] || 0);
      }
      return prefixes;
    });

    const renderItems = computed(() =>
      Array(isLoop.value ? 3 : 1)
        .fill(props.list)
        .flat()
    );

    const state = ref<WheelPickerState>("idle");
    const velocity = ref(0);
    const lastPosition = ref(0);
    const startPosition = ref(0);
    const wheelAcc = ref(0);
    const raf = ref<number | null>(null);

    const rawOff = ref(0);
    const offset = computed({
      get: () => rawOff.value,
      set: (val: number) => {
        rawOff.value = clampOffset(val);
      },
    });

    const realSize = computed(() => {
      const sizes = itemSizes.value.map(([main, _]) => main);
      return sum(sizes.slice(0, props.list.length));
    });

    const wrapperSize = computed(() => {
      const sizes = itemSizes.value.map(([main, _]) => main);
      const length = props.list.length;
      const count = Math.max(3, Math.min(length, props.show));

      if (sizes.length === 0 || count === 0) return 0;

      if (length >= count) {
        let currentSum = sum(sizes.slice(0, count));
        let maxSum = currentSum;

        // sliding window
        for (let i = count; i < length; i++) {
          currentSum = currentSum - sizes[i - count] + sizes[i];
          maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
      } else {
        const totalSize = sum(sizes.slice(0, length));
        return (totalSize * count) / length;
      }
    });

    function clampOffset(offset: number) {
      const length = props.list.length;
      const real = realSize.value;
      const wrapper = wrapperSize.value;

      if (!real) return 0;
      if (!isLoop.value) {
        const [min, max] = [-0.5 * wrapper, 0.5 * wrapper + real];
        return Math.max(min, Math.min(max, offset));
      } else {
        const startCenter = getCenterOffset(length);
        const endCenter = getCenterOffset(2 * length);
        const loopRange = endCenter - startCenter;

        if (loopRange <= 0) return offset;

        return startCenter + ((offset - startCenter) % loopRange);
      }
    }

    function clampIndex(index: number) {
      return (index % props.list.length) + props.list.length;
    }

    function normalizeIndex(index: number) {
      return index % props.list.length;
    }

    function getCenterOffset(index: number) {
      if (itemSizes.value.length === 0) return 0;
      return itemPrefixes.value[index] + itemSizes.value[index][0] / 2 - wrapperSize.value / 2;
    }

    function getNearestIndex() {
      let [min, idx] = [Infinity, 0];
      for (let i = 0; i < itemSizes.value.length; i++) {
        const distance = Math.abs(offset.value - getCenterOffset(i));
        if (distance < min) {
          min = distance;
          idx = i;
        }
      }
      return idx;
    }

    function initAnime(newState: WheelPickerState = "idle") {
      if (raf.value !== null) {
        cancelAnimationFrame(raf.value);
        raf.value = null;
      }
      state.value = newState;
    }

    function snapToIndex(index?: number) {
      initAnime("snap");

      const idx = isUndefined(index) ? getNearestIndex() : index;
      const startOffset = offset.value;
      const targetOffset = getCenterOffset(idx);
      const realTargetOffset = getCenterOffset(clampIndex(idx));

      const startTime = performance.now();
      const snap = (now: number) => {
        const progress = Math.min((now - startTime) / DURATION, 1);
        offset.value = startOffset + (targetOffset - startOffset) * EASE(progress);

        if (progress < 1) {
          raf.value = requestAnimationFrame(snap);
        } else {
          state.value = "idle";
          offset.value = realTargetOffset;
          emit("update:modelValue", normalizeIndex(idx));
        }
      };
      raf.value = requestAnimationFrame(snap);
    }

    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!["idle", "snap", "inertia", "scroll"].includes(state.value)) return;

      initAnime("drag");

      const evt = "touches" in e ? e.touches[0] : e;
      lastPosition.value = isVertical.value ? evt.clientY : evt.clientX;
      startPosition.value = lastPosition.value;
      velocity.value = 0;
    }

    function onPointerMove(e: MouseEvent | TouchEvent) {
      if (state.value !== "drag") return;

      e.preventDefault();

      const evt = "touches" in e ? e.touches[0] : e;
      const curPosition = isVertical.value ? evt.clientY : evt.clientX;
      const delta = lastPosition.value - curPosition;

      offset.value += delta;
      velocity.value = delta;
      lastPosition.value = curPosition;
    }

    function onPointerUp(_: MouseEvent | TouchEvent) {
      if (state.value !== "drag") return;

      if (Math.abs(velocity.value) < VELOCITY_THRESHOLD) {
        if (Math.abs(startPosition.value - lastPosition.value) > MOVE_THRESHOLD) {
          snapToIndex();
        }
        state.value = "idle";
        return;
      }

      initAnime("inertia");
      const inertia = () => {
        velocity.value *= 1 - DECELERATION;
        offset.value += velocity.value;

        if (Math.abs(velocity.value) > VELOCITY_THRESHOLD) {
          raf.value = requestAnimationFrame(inertia);
        } else {
          snapToIndex();
        }
      };
      raf.value = requestAnimationFrame(inertia);
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      initAnime("scroll");

      const delta = isVertical.value ? e.deltaY : e.deltaX;
      const scale = wrapperSize.value / (isVertical.value ? window.innerHeight : window.innerWidth);
      wheelAcc.value += delta * scale;

      const smooth = () => {
        const step = wheelAcc.value / SMOOTH_STEP;
        wheelAcc.value -= step;
        offset.value += step;

        if (Math.abs(wheelAcc.value) > SMOOTH_THRESHOLD) {
          raf.value = requestAnimationFrame(smooth);
        } else {
          wheelAcc.value = 0;
          snapToIndex();
        }
      };
      raf.value = requestAnimationFrame(smooth);
    }

    function onClickItem(index: number) {
      if (state.value !== "idle") return;
      snapToIndex(index);
    }

    onBeforeMount(() => {
      const resizeObserver = new ResizeObserver((entries) => {
        const newSizes = [...itemSizes.value];
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const indexStr = target.dataset.index;
          const renderIndex = parseInt(indexStr, 10);

          const { offsetWidth: W, offsetHeight: H } = target;
          newSizes[renderIndex] = isVertical.value ? [H, W] : [W, H];
        });
        itemSizes.value = newSizes;
        // init bind after itemSizes set
        snapToIndex(clampIndex(props.modelValue));
      });

      watch(
        itemRefs,
        (items) => {
          resizeObserver.disconnect();
          items.forEach((item) => resizeObserver.observe(item));
        },
        { deep: true, flush: "post" }
      );

      watch(
        () => props.modelValue,
        (newVal, oldVal) => {
          if (newVal === oldVal) return;
          snapToIndex(clampIndex(newVal));
        },
        { flush: "post" }
      );

      watchEffect(
        (onCleanup) => {
          const el = pickerRef.value;
          if (el) {
            el.addEventListener("mousemove", onPointerMove, { passive: false });
            el.addEventListener("touchmove", onPointerMove, { passive: false });
            el.addEventListener("wheel", onWheel, { passive: false });
          }
          onCleanup(() => {
            el.removeEventListener("mousemove", onPointerMove);
            el.removeEventListener("touchmove", onPointerMove);
            el.removeEventListener("wheel", onWheel);
          });
        },
        { flush: "post" }
      );

      onBeforeUnmount(() => {
        resizeObserver.disconnect();
        initAnime();
      });
    });

    const ns = useBem("wheel-picker");
    return () => {
      const kls = {
        wrap: [ns.b(), ns.m(props.size), ns.m(props.direction)],
        content: [ns.e("content"), ns.em("content", props.direction)],
        indicator: [ns.e("indicator"), ns.em("indicator", props.size)],
        item: [ns.e("item"), ns.em("item", props.size)],
      };

      const [main, cross] = itemSizes.value[props.modelValue] || [0, 0];

      const pickerStyl: CSSProperties = {
        [isVertical.value ? "height" : "width"]: `${wrapperSize.value}px`,
      };

      const ctnStyl: CSSProperties = {
        transform: isVertical.value
          ? `translate3d(0, ${-offset.value}px, 0)`
          : `translate3d(${-offset.value}px, 0, 0)`,
      };

      const indicatorStyl: CSSProperties = {
        [isVertical.value ? "height" : "width"]: `${main}px`,
        [isVertical.value ? "width" : "height"]: `${cross}px`,
      };

      return (
        <div
          ref={pickerRef}
          class={kls.wrap}
          style={pickerStyl}
          onMousedown={onPointerDown}
          onTouchstart={onPointerDown}
          onMouseup={onPointerUp}
          onMouseleave={onPointerUp}
          onTouchend={onPointerUp}
        >
          <div class={kls.content} style={ctnStyl}>
            {renderItems.value.map((item, i) => (
              <div
                key={i}
                class={kls.item}
                data-index={i}
                ref={(el) => (itemRefs.value[i] = el)}
                onClick={() => onClickItem(i)}
              >
                {String(item)}
              </div>
            ))}
          </div>
          <div class={kls.indicator} style={indicatorStyl} />
        </div>
      );
    };
  },
});

export { VtiWheelPicker };
