<script setup lang="ts">
import { useBem, useI18n, useIcon, useOS, useSearchState, useTheme } from "../../composables";
import { computed } from "vue";

const { response } = useTheme();
const { metaKey } = useOS();
const { t } = useI18n();
const { open } = useSearchState();

const IconSearch = useIcon("magnifying-glass");
const ns = useBem("nav-search");
const kls = computed(() => ({
  wrap: [ns.b(), ns.m(response.value)],
  text: ns.e("text"),
  shortcut: ns.e("shortcut"),
}));
</script>

<template>
  <div :class="kls.wrap" @click="open">
    <IconSearch v-if="response !== 'desktop'" />
    <template v-else>
      <IconSearch />
      <span :class="kls.text">{{ t("nav.search") }}</span>
      <span :class="kls.shortcut">
        <kbd>{{ metaKey }}</kbd
        >+<kbd>k</kbd>
      </span>
    </template>
  </div>
</template>
