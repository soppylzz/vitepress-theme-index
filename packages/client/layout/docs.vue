<script setup lang="ts">
import { VtiSidebar, VtiAside } from "../components";
import { Content } from "vitepress";
</script>

<template>
  <div class="test">
    <VtiSidebar />
    <div>
      <div>
        <!--  Docs SubNav  -->

        <!--  Docs Header  -->
        <div />
        <!--  Docs Content  -->
        <Content />
        <!--  Docs Footer  -->
        <div />
      </div>
    </div>
    <VtiAside />
  </div>
</template>

<style scoped>
.test {
  height: 200vh;
}
</style>
