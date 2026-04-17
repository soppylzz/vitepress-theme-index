<script setup lang="ts">
import { Content, useData } from "vitepress";
import { VtiDocs, VtiHome, VtiArchive } from "./layout";
import { VtiNav } from "./components";
import { useBem } from "./composables";

const { frontmatter } = useData();
const ns = useBem("layout");
</script>

<template>
  <div v-if="frontmatter.layout !== false" :class="[ns.b()]">
    <ClientOnly>
      <VtiNav />
      <VtiHome v-if="frontmatter.layout === 'home'" />
      <VtiArchive v-else-if="frontmatter.layout === 'archive'" />
      <VtiDocs v-else />
    </ClientOnly>
  </div>
  <Content v-else />
</template>
