<script setup lang="ts">
import { VtiSidebar, VtiAside } from "../components";
import { Content } from "vitepress";
</script>

<template>
  <div>
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
