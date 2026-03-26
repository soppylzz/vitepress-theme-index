<script setup lang="ts">
import { Content, useData } from "vitepress";
import { VtiDocs, VtiHome } from "./layout";
import { VtiNav } from "./components";

const { frontmatter } = useData();
</script>

<template>
  <div v-if="frontmatter.layout !== false">
    <VtiNav />
    <VtiDocs v-if="frontmatter.layout === 'docs'" />
    <VtiHome />
  </div>
  <Content v-else />
</template>
