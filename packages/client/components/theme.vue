<script setup lang="ts">
import type { IndexDirection, IndexSize, IndexThemeMode } from "../types";
import { useBem, useDecorator, useTheme } from "../composables";
import { VtiWheelPicker } from "./wheel-picker";
import { computed, onMounted, shallowRef, watch } from "vue";
import gsap from "gsap";

const {
  ctx,
  setMode,
  setPreset,
  available: { preset, mode },
} = useTheme();
const props = withDefaults(defineProps<Partial<{ size: IndexSize; direction: IndexDirection }>>(), {
  size: "medium",
  direction: "row",
});

const path = shallowRef<SVGPathElement | null>(null);
let t: gsap.core.Tween | null = null;

const presetId = computed({
  get: () => preset.findIndex((item) => item === ctx.preset),
  set: (idx: number) => setPreset(preset[idx]),
});

const themeMode = computed({
  get: () => ctx.mode,
  set: (value) => setMode(value),
});

const { withId } = useDecorator();

function changeIcon(mod: IndexThemeMode) {
  if (!path.value) return;
  if (t) t.kill();

  t = gsap.to(path.value, {
    morphSVG: `#${withId(mod)}`,
    duration: 0.4,
    ease: "power2.inOut",
    overwrite: true,
  });
}

onMounted(() => {
  setPreset(preset[presetId.value]);
  watch(themeMode, (val) => changeIcon(val), { immediate: true });
});

const ns = useBem("theme");
const kls = computed(() => ({
  wrap: [ns.b(), ns.m(props.direction)],
  divider: [ns.em("divider", props.direction)],
  switch: [ns.e("switch"), ns.em("switch", props.size)],
  slider: [ns.e("slider"), ns.em("slider", themeMode.value), ns.em("slider", props.size)],
}));
</script>

<template>
  <div :class="kls.wrap">
    <VtiWheelPicker
      v-model="presetId"
      :direction="props.direction"
      :size="props.size"
      :list="[...preset]"
      :loop="true"
    />
    <div :class="kls.divider" />
    <div :class="kls.switch">
      <div v-for="(mod, index) in mode" :key="index" @click="() => (themeMode = mod)" />
      <div :class="kls.slider">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <!--! Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
          <defs>
            <path
              :id="withId('dark')"
              d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z"
            />
            <path
              :id="withId('auto')"
              d="M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z"
            />
            <path
              :id="withId('light')"
              d="M210.2 53.9C217.6 50.8 226 51.7 232.7 56.1L320.5 114.3L408.3 56.1C415 51.7 423.4 50.9 430.8 53.9C438.2 56.9 443.4 63.5 445 71.3L465.9 174.5L569.1 195.4C576.9 197 583.5 202.4 586.5 209.7C589.5 217 588.7 225.5 584.3 232.2L526.1 320L584.3 407.8C588.7 414.5 589.5 422.9 586.5 430.3C583.5 437.7 576.9 443.1 569.1 444.6L465.8 465.4L445 568.7C443.4 576.5 438 583.1 430.7 586.1C423.4 589.1 414.9 588.3 408.2 583.9L320.4 525.7L232.6 583.9C225.9 588.3 217.5 589.1 210.1 586.1C202.7 583.1 197.3 576.5 195.8 568.7L175 465.4L71.7 444.5C63.9 442.9 57.3 437.5 54.3 430.2C51.3 422.9 52.1 414.4 56.5 407.7L114.7 320L56.5 232.2C52.1 225.5 51.3 217.1 54.3 209.7C57.3 202.3 63.9 196.9 71.7 195.4L175 174.6L195.9 71.3C197.5 63.5 202.9 56.9 210.2 53.9zM239.6 320C239.6 275.6 275.6 239.6 320 239.6C364.4 239.6 400.4 275.6 400.4 320C400.4 364.4 364.4 400.4 320 400.4C275.6 400.4 239.6 364.4 239.6 320zM448.4 320C448.4 249.1 390.9 191.6 320 191.6C249.1 191.6 191.6 249.1 191.6 320C191.6 390.9 249.1 448.4 320 448.4C390.9 448.4 448.4 390.9 448.4 320z"
            />
          </defs>
          <path
            ref="path"
            d="M320 265C334.587 265 348.576 270.794 358.89 281.11C369.206 291.424 375 305.413 375 320C375 334.587 369.206 348.576 358.89 358.89C348.576 369.206 334.587 375 320 375C305.413 375 291.424 369.206 281.11 358.89C270.794 348.576 265 334.587 265 320C265 305.413 270.794 291.424 281.11 281.11C291.424 270.794 305.413 265 320 265Z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>
