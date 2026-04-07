<script setup lang="ts">
import { useBem, useI18n, useLink, usePrevNext, useText } from "../../composables";
import { computed } from "vue";

const { t } = useI18n();

const { prev, next } = usePrevNext();
const { attr: pLink } = useLink(prev);
const { attr: nLink } = useLink(next);

const ns = useBem("docs-page");
const kls = computed(() => ({
  wrap: ns.b(),
  prev: ns.e("prev"),
  next: ns.e("next"),
}));
</script>

<template>
  <div :class="kls.wrap">
    <a v-if="prev" :class="kls.prev" v-bind="pLink">
      <span>{{ t("docs.prev") }}</span>
      <span>{{ useText(prev.text) }}</span>
    </a>
    <a v-if="next" :class="kls.next" v-bind="nLink">
      <span>{{ t("docs.next") }}</span>
      <span>{{ useText(next.text) }}</span>
    </a>
  </div>
</template>
