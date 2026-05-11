<script setup lang="ts">
import { computed } from "vue";
import { ensureArray } from "@vitepress-theme-index/shared";
import { useBem, useText } from "../../composables";
import type { SearchHelpProps } from "../../types";
import { VtiKey } from "../../components";

const props = withDefaults(defineProps<SearchHelpProps>(), {
  size: "medium",
  direction: "col",
});

const ns = useBem("search-help");
const kls = computed(() => {
  return {
    wrap: [ns.b(), ns.m(props.direction), props.align && ns.m(props.align), ns.m(props.size)],
    item: (type: "text" | "key" | "title") => [
      ns.e("item"),
      ns.em("item", type),
      ns.em("item", props.size),
    ],
  };
});
</script>

<template>
  <div :class="kls.wrap">
    <template v-for="(help, index) in props.helps">
      <div v-if="['text', 'title'].includes(help.type)" :key="index" :class="kls.item(help.type)">
        {{ useText(help.help) }}
      </div>
      <div v-if="help.type === 'key'" :key="index" :class="kls.item('key')">
        <template v-for="(key, i) in ensureArray(help.keys)" :key="i">
          <VtiKey :val="key" :size="props.size" />
        </template>
        <div>{{ useText(help.help) }}</div>
      </div>
    </template>
  </div>
</template>
