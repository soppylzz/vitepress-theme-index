<script setup lang="ts">
import { useBem, useHasProps, useIcon, useText } from "../../composables";
import type { SearchLoadingProps } from "../../types";
import { computed, onMounted, ref, watchEffect } from "vue";
import gsap from "gsap";

/** icon scale heartbeat */
const HEARTBEAT_SCALE = 1.18;
const HEARTBEAT_DURATION = 0.5;

/** icon rotate */
const ROTATE_DURATION = 1.4;

/** text wave */
const TEXT_WAVE_Y = -8;
const TEXT_WAVE_DURATION = 0.5;
const TEXT_WAVE_STAGGER = 0.06;

const props = withDefaults(defineProps<SearchLoadingProps>(), {
  anime: "rotate",
});

const ns = useBem("search-loading");
const kls = computed(() => ({
  wrap: ns.b(),
  icon: ns.e("icon"),
  text: ns.e("text"),
  char: ns.e("char"),
}));

const Icon = useIcon(props.icon);
const hasIcon = useHasProps(props, "icon");

const iconRef = ref<HTMLDivElement>();
const charRefs = ref<HTMLSpanElement[]>([]);

const chars = computed(() => useText(props.text).split(""));

const ctx: gsap.Context | null = null;

onMounted(() => {
  watchEffect(
    (onCleanup) => {
      void props.text;
      void props.anime;

      const ctx = gsap.context(() => {
        /**
         * icon animation
         */
        if (iconRef.value) {
          if (props.anime === "scale") {
            gsap.to(iconRef.value, {
              scale: HEARTBEAT_SCALE,
              duration: HEARTBEAT_DURATION,
              ease: "power1.inOut",
              yoyo: true,
              repeat: -1,
              transformOrigin: "center center",
            });
          }

          if (props.anime === "rotate") {
            gsap.to(iconRef.value, {
              rotate: 360,
              duration: ROTATE_DURATION,
              ease: "none",
              repeat: -1,
              transformOrigin: "center center",
            });
          }

          charRefs.value.forEach((char, index) => {
            gsap.to(char, {
              keyframes: [{ y: 0 }, { y: TEXT_WAVE_Y }, { y: 0 }],

              duration: 1.2,
              repeat: -1,
              ease: "sine.inOut",

              delay: index * TEXT_WAVE_STAGGER,
            });
          });
        }
      });
      onCleanup(() => {
        ctx.revert();
      });
    },
    { flush: "post" }
  );
});
</script>

<template>
  <div :class="kls.wrap">
    <div v-if="hasIcon" ref="iconRef" :class="kls.icon">
      <Icon />
    </div>

    <div :class="kls.text">
      <span
        v-for="(char, index) in chars"
        :key="index"
        :ref="
          (el) => {
            if (!el) return;
            charRefs[index] = el as HTMLElement;
          }
        "
        :class="kls.char"
      >
        {{ char }}
      </span>
    </div>
  </div>
</template>
