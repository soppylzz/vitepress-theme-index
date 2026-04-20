<script setup lang="ts">
import { VtiSearch, VtiVirtualList, VtiWheelPicker } from "../components";
import { ref } from "vue";
import { IndexDirection } from "../types";

const candidates = ref(["默认主题", "像素艺术"]);
const idx = ref(Math.floor(candidates.value.length / 2));
</script>

<template>
  <div class="test">
    <h1>ARCHIVE TEST</h1>
    <div :style="{ height: '50px' }">
      <VtiWheelPicker v-model="idx" direction="row" :list="candidates" loop />
    </div>
    {{ idx }}
  </div>
</template>
