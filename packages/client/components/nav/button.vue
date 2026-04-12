<script setup lang="ts">
import type { NavButtonProps } from "../../types";
import { hasEmitHook, useBem, useIcon, useLink, useText } from "../../composables";
import { hasOwnProperty } from "@vitepress-theme-index/shared";
import { computed } from "vue";
import { VtiPopper } from "../public";
import { useRoute } from "vitepress";

const emit = defineEmits<{ (e: "activate"): void }>();
const props = withDefaults(defineProps<NavButtonProps>(), { delay: 300 });

const route = useRoute();
const hasHook = hasEmitHook("activate");
const { attr } = useLink(props, hasHook);

const isIcon = computed(() => !!props?.icon && !props.text);
const isText = computed(() => hasOwnProperty(props, "text") && !!props.text);
const isActive = computed(() => !hasHook && route.path.startsWith(attr.value.href));
const hasTooltip = computed(
  () => hasOwnProperty(props, "content") && !!useText(props.content)?.trim()
);

const ns = useBem("nav-button");
const kls = computed(() => ({
  wrap: ns.b(),
  link: [
    ns.e("link"),
    ns.em("link", props.container),
    ns.when("icon", isIcon.value),
    ns.when("active", isActive.value),
  ],
}));
</script>

<template>
  <div :class="kls.wrap">
    <a v-if="isText" v-bind="attr" :class="kls.link" @click="emit('activate')">
      <component :is="useIcon(props.icon)" v-if="props?.icon" />
      <span>{{ useText(props.text) }}</span>
    </a>
    <template v-else>
      <VtiPopper
        v-if="hasTooltip"
        size="small"
        placement="bottom"
        :content="props.content"
        :delay="props.delay"
      >
        <a v-bind="attr" :class="kls.link" @click="emit('activate')">
          <component :is="useIcon(props.icon)" />
        </a>
      </VtiPopper>
      <a v-else v-bind="attr" :class="kls.link" @click="emit('activate')">
        <component :is="useIcon(props.icon)" />
      </a>
    </template>
  </div>
</template>
