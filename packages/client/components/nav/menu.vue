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
  wrap: [ns.b(), ns.m(props.container!)],
  trigger: [ns.e("trigger"), ns.when("expanded", expanded.value)],
  popup: [ns.e("popup"), ns.when("visible", expanded.value)],
  menu: ns.e("menu"),
}));

const handleScreenTrigger = () => {
  expanded.value = !expanded.value;
};

const closeMenu = () => {
  if (isScreenMode.value) {
    expanded.value = false;
  }
};
</script>

<template>
  <div :class="kls.wrap">
    <!-- Header Mode: Popper with trigger + menu -->
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
        <div :class="kls.menu">
          <VtiMenu size="small">
            <slot />
          </VtiMenu>
        </div>
      </template>
    </VtiPopper>

    <!-- Screen Mode: Collapsible menu -->
    <template v-else-if="isScreenMode">
      <div :class="kls.trigger" @click="handleScreenTrigger">
        <component :is="useIcon(props.icon)" v-if="props?.icon" />
        <span>{{ useText(props.text) }}</span>
      </div>
      <div v-show="expanded" :class="kls.popup">
        <VtiMenu size="small">
          <slot />
        </VtiMenu>
      </div>
    </template>
  </div>
</template>
