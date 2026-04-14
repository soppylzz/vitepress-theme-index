<script setup lang="ts">
import { useI18n } from "../composables";

const { currentRoutes } = useI18n();
</script>

<template>
  <div>{{ currentRoutes }}</div>
</template>
