<script setup lang="ts">
import { useBem, useI18n, useTheme } from "../../composables";
import { computed, ref } from "vue";

const { t } = useI18n();
const { response } = useTheme();
const searchText = ref("");

function handleSearch() {}

const ns = useBem("search");
const kls = computed(() => ({
  wrap: [ns.b()],
  input: [],
  result: [],
}));
</script>

<template>
  <div :class="kls.wrap">
    <input
      v-model="searchText"
      :placeholder="t('search.placeholder')"
      :class="kls.input"
      @input="handleSearch"
    />
    <div />
  </div>
</template>
