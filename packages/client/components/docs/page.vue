<script setup lang="ts">
import { useBem, useI18n } from "../../composables";
import { computed } from "vue";
import { useData } from "vitepress";

const { t } = useI18n();
const ns = useBem("docs-page");
const kls = computed(() => ({
  wrap: ns.b(),
  prev: ns.e("prev"),
  next: ns.e("next"),
}));
</script>

<template>
  <div :class="kls.wrap">
    <a :class="kls.prev">
      <span>{{ t("docs.prev") }}</span>
      <span>TEMP</span>
    </a>
    <a :class="kls.next">
      <span>{{ t("docs.next") }}</span>
      <span>TEMP</span>
    </a>
  </div>
</template>
