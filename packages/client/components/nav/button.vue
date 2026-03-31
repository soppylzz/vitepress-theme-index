<script setup lang="ts">
import type { NavButtonProps } from "../../types";
import { useBem, useIcon, useLink, useText } from "../../composables";
import { hasOwnProperty } from "@vitepress-theme-index/shared";
import { computed, useAttrs } from "vue";
import { VtiPopper } from "../public";

const attrs = useAttrs();
const hasOnActivate = computed(() => "onActivate" in attrs);

const emit = defineEmits<{ (e: "onActivate"): void }>();
const props = withDefaults(defineProps<NavButtonProps>(), {
  delay: 300,
});

const { attr } = useLink(props);

const isTextMode = (props: any) => hasOwnProperty(props, "text") && !!props.text;
const hasTooltip = (props: any) =>
  hasOwnProperty(props, "content") && !!useText(props.content)?.trim();

const handleClick = (e: MouseEvent) => {
  if (hasOnActivate.value) {
    emit("onActivate");
    e.preventDefault();
  }
};

const ns = useBem("nav-button");
const kls = computed(() => ({
  wrap: [ns.b()],
  link: ns.e("link"),
}));
</script>

<template>
  <div :class="kls.wrap">
    <a v-if="isTextMode(props)" v-bind="attr" :class="kls.link" @click="handleClick">
      <component :is="useIcon(props.icon)" v-if="props?.icon" />
      <span>{{ useText(props.text) }}</span>
    </a>
    <template v-else>
      <VtiPopper
        v-if="hasTooltip(props)"
        size="small"
        placement="bottom"
        :content="props.content"
        :delay="props.delay"
      >
        <a v-bind="attr" :class="kls.link" @click="handleClick">
          <component :is="useIcon(props.icon)" />
        </a>
      </VtiPopper>
      <a v-else v-bind="attr" :class="kls.link" @click="handleClick">
        <component :is="useIcon(props.icon)" />
      </a>
    </template>
  </div>
</template>
