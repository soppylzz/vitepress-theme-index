<script setup lang="ts">
import { useBem, useI18n, useTheme, useSiteSearch } from "../../composables";
import { computed, ref } from "vue";
import VtiSearchItem from "./item.vue";

const { t } = useI18n();
// const { response } = useTheme();
const searchText = ref("");

const { search, loading, results } = useSiteSearch();

function handleSearch() {
  search(searchText.value);
}

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
    <div :class="kls.result">
      <div v-if="loading" role="status">{{ t("search.loading") }}</div>
      <div v-else-if="searchText && results.length === 0" role="status">
        {{ t("search.no-results") }}
      </div>
      <VtiSearchItem v-for="result in results" :key="result.id" :result="result" />
    </div>
  </div>
</template>
