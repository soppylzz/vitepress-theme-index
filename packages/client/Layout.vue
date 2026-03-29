<script setup lang="ts">
import { Content, useData } from "vitepress";
import { VtiDocs, VtiHome } from "./layout";
import { VtiNav } from "./components";

const { frontmatter } = useData();
</script>

<template>
  <div v-if="frontmatter.layout !== false">
    <VtiNav />
    <VtiHome v-if="frontmatter.layout === 'home'" />
    <VtiDocs v-else />
  </div>
  <Content v-else />
</template>
