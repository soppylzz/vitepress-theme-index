<script setup lang="ts">
import { useBem, useI18n, useLink, usePrevNext, useText, useTheme } from "../../composables";
import { computed } from "vue";

const { t } = useI18n();

const { response } = useTheme();

const { prev, next } = usePrevNext();
const { attr: pLink } = useLink(prev);
const { attr: nLink } = useLink(next);

const ns = useBem("docs-page");
const kls = computed(() => ({
  wrap: [ns.b(), ns.when("column", response.value === "mobile")],
  button: ns.e("button"),
}));
</script>

<template>
  <div v-if="prev || next" :class="kls.wrap">
    <div :class="[kls.button, ns.when('hidden', !prev)]" data-prev>
      <a v-if="prev" v-bind="pLink">
        <span>{{ t("docs.prev") }}</span>
        <span>{{ useText(prev.text) }}</span>
      </a>
    </div>
    <div :class="[kls.button, ns.when('hidden', !next)]" data-prev>
      <a v-if="next" v-bind="nLink">
        <span>{{ t("docs.next") }}</span>
        <span>{{ useText(next.text) }}</span>
      </a>
    </div>
  </div>
</template>
