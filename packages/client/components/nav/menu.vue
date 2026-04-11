<script setup lang="ts">
import { ref, computed } from "vue";
import type { NavMenuProps } from "../../types";
import { useBem, useIcon, useText } from "../../composables";
import { VtiPopper, VtiMenu } from "../public";

const props = withDefaults(defineProps<NavMenuProps>(), {
  container: "header",
  activateEvent: "click",
});

const expanded = ref(false);
const ns = useBem("nav-menu");

const isHeaderMode = computed(() => props.container === "header");
const isScreenMode = computed(() => props.container === "screen");

const kls = computed(() => ({
  wrap: [ns.b(), ns.m(props.container)],
  trigger: [
    ns.e("trigger"),
    ns.em("trigger", props.container),
    ns.when("expanded", expanded.value),
  ],
  divider: ns.em("divider", props.container),
}));
</script>

<template>
  <div :class="kls.wrap">
    <VtiPopper
      v-if="isHeaderMode"
      mode="block"
      placement="top"
      :auto-place="true"
      :activate-event="props.activateEvent"
    >
      <div :class="kls.trigger">
        <component :is="useIcon(props.icon)" v-if="props?.icon" />
        <span>{{ useText(props.text) }}</span>
      </div>
      <template #content>
        <VtiMenu size="small" is-collapsed>
          <slot />
        </VtiMenu>
      </template>
    </VtiPopper>
    <template v-else-if="isScreenMode">
      <div :class="kls.trigger" @click="expanded = !expanded">
        <span>{{ useText(props.text) }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <!--! Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
          <path
            d="M201.4 297.4C188.9 309.9 188.9 330.2 201.4 342.7L361.4 502.7C373.9 515.2 394.2 515.2 406.7 502.7C419.2 490.2 419.2 469.9 406.7 457.4L269.3 320L406.6 182.6C419.1 170.1 419.1 149.8 406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3L201.3 297.3z"
          />
        </svg>
        <component :is="useIcon(props.icon)" v-if="props?.icon" />
      </div>
      <VtiMenu v-if="expanded" size="medium" is-collapsed>
        <slot />
      </VtiMenu>
      <div :class="kls.divider"><!--  divider last  --></div>
    </template>
  </div>
</template>
