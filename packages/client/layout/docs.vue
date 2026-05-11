<script setup lang="ts">
import { Content } from "vitepress";
import { computed, ref } from "vue";
import { useBem, useLayout, useTheme } from "../composables";
import type { IndexSize } from "../types";
import { VtiDocsCard, VtiDocsPage } from "./docs";
import { VtiSidebar } from "./sidebar";
import { VtiLocalNavDocs } from "./local-nav";
import { VtiFooterDocs } from "./footer";
import { VtiComment } from "./comment";
import { VtiToc } from "../components";

const menu = ref(false);
const { response } = useTheme();
const { hasToc, hasSidebar } = useLayout();
const tocSize = computed<IndexSize>(() => (response.value === "mobile" ? "small" : "medium"));

const ns = useBem("docs");
const kls = computed(() => ({
  wrap: ns.b(),
  column: ns.e("column"),
  content: ns.e("content"),
  sidebar: [ns.e("sidebar"), ns.em("sidebar", response.value)],
  aside: [ns.e("aside"), ns.em("aside", response.value)],
}));
</script>

<template>
  <div :class="kls.wrap">
    <div v-if="hasSidebar" :class="kls.sidebar">
      <VtiSidebar v-model="menu" />
    </div>
    <div :class="kls.column">
      <VtiLocalNavDocs v-model="menu">
        <VtiToc :size="tocSize" />
      </VtiLocalNavDocs>
      <div :class="kls.content">
        <div :class="kls.column">
          <Content class="markdown-body" />
          <VtiDocsCard />
          <VtiDocsPage />
          <VtiComment />
        </div>
        <div v-if="hasToc" :class="kls.aside">
          <VtiToc size="large" />
        </div>
      </div>
      <VtiFooterDocs />
    </div>
  </div>
</template>
