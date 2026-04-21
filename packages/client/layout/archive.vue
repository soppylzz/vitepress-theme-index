<script setup lang="ts">
import { VtiSearch, VtiVirtualList, VtiWheelPicker } from "../components";
import { ref } from "vue";
import { IndexDirection } from "../types";
import { useTheme } from "../composables";

const { ctx } = useTheme();

const candidates = ref(["默认", "像素"]);
const idx = ref(Math.floor(candidates.value.length / 2));
</script>

<template>
  <div class="test">
    <h1>ARCHIVE TEST</h1>
    <!--    <VtiWheelPicker v-model="idx" direction="row" :list="candidates" loop size="small" />-->
    {{ idx }}<br />
    {{ ctx }}
  </div>
</template>
