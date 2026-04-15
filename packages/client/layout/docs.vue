<script setup lang="ts">
import {
  VtiSidebar,
  VtiSubNav,
  VtiDocsCard,
  VtiDocsPage,
  VtiToc,
  VtiDocsFooter,
} from "../components";
import { Content } from "vitepress";
import { computed, ref } from "vue";
import { useBem, useLayout, useTheme } from "../composables";
import type { IndexSize } from "../types";

const menu = ref(true);
const { response } = useTheme();
const { hasToc, hasSidebar } = useLayout();
const tocSize = computed<IndexSize>(() => (response.value === "mobile" ? "small" : "medium"));

const ns = useBem("docs");
const kls = computed(() => ({
  wrap: ns.b(),
  sidebar: [ns.e("sidebar"), ns.em("sidebar", response.value)],
  content: [ns.e("content"), ns.em("content", response.value)],
}));
</script>

<template>
  <div :class="kls.wrap">
    <div v-if="hasSidebar" :class="kls.sidebar">
      <VtiSidebar v-model="menu" />
    </div>
    <div id="vti-docs-main">
      <VtiSubNav v-model="menu">
        <VtiToc :size="tocSize" />
      </VtiSubNav>
      <div :class="kls.content">
        <div id="vti-docs-content">
          <Content class="markdown-body" />
          <VtiDocsCard />
          <VtiDocsPage />
        </div>
        <div v-if="hasToc" id="vti-docs-aside">
          <VtiToc size="large" />
        </div>
      </div>
      <VtiDocsFooter />
    </div>
  </div>
</template>
