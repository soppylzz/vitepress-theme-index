<script setup lang="ts">
import { Content, useData } from "vitepress";
import { VtiDocs, VtiHome } from "./layout";
import { VtiNav } from "./components";
import { useBem } from "./composables";

const { frontmatter } = useData();
const ns = useBem("layout");
</script>

<template>
  <div v-if="frontmatter.layout !== false" :class="[ns.b()]">
    <VtiNav />
    <VtiHome v-if="frontmatter.layout === 'home'" />
    <VtiDocs v-else />
  </div>
  <Content v-else />
</template>
