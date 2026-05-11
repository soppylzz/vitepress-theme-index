<script setup lang="ts">
import { ref } from "vue";
import { useTheme } from "../composables";
import { VtiWheelPicker } from "../components";

const { ctx } = useTheme();
const candidates = ref(["默认", "像素模式", "测试"]);
const idx = ref(0);
</script>

<template>
  <div class="test">
    <h1>ARCHIVE TEST</h1>
    <VtiWheelPicker v-model="idx" direction="row" :list="candidates" loop size="small" debug />
  </div>
</template>
