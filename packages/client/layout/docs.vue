<script setup lang="ts">
import { VtiSidebar, VtiAside } from "../components";
import { Content } from "vitepress";
import { ref } from "vue";

const switch_ = ref(true);
</script>

<template>
  <div class="test">
    <VtiSidebar />
    <div>
      <div>
        <!--  Docs SubNav  -->
        <div />
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
