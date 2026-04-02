<script setup lang="ts">
import { VtiSidebar, VtiSubNav, VtiDocsCard, VtiDocsPage, VtiToc } from "../components";
import { Content } from "vitepress";
import { computed, ref } from "vue";
import { useBem } from "../composables";

const menu = ref(false);

const ns = useBem("docs");
const kls = computed(() => ({
  wrap: ns.b(),
  main: ns.e("main"),
  content: ns.e("content"),
  aside: ns.e("aside"),
}));
</script>

<template>
  <div :class="kls.wrap">
    <VtiSidebar v-model="menu" />
    <div :class="kls.main">
      <VtiSubNav v-model="menu">
        <VtiToc size="large" />
      </VtiSubNav>
      <div :class="kls.content">
        <Content />
      </div>
      <VtiDocsCard />
      <VtiDocsPage />
    </div>
    <div :class="kls.aside">
      <VtiToc size="small" />
    </div>
  </div>
</template>
