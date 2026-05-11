<script setup lang="ts">
import { Content, useData } from "vitepress";
import { VtiDocs, VtiHome, VtiArchive, VtiNav, VtiSearch } from "./layout";
import { useBem, useThemeData } from "./composables";
import { onMounted, shallowRef } from "vue";

const { frontmatter } = useData();
const ns = useBem("layout");
const rootRef = shallowRef<HTMLElement | null>(null);
useThemeData(rootRef);

onMounted(() => {
  rootRef.value = document.documentElement;
});
</script>

<template>
  <div v-if="frontmatter.layout !== false" :class="[ns.b()]">
    <VtiNav />
    <VtiSearch />
    <VtiHome v-if="frontmatter.layout === 'home'" />
    <VtiArchive v-else-if="frontmatter.layout === 'archive'" />
    <VtiDocs v-else />
  </div>
  <Content v-else />
</template>
