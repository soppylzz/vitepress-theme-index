<script setup lang="ts">
import VtiNavMenu from "./menu.vue";
import { VtiMenuButton, VtiMenuDivider } from "../menu";
import { useI18n, useTheme } from "../../composables";
import { computed } from "vue";

const { response } = useTheme();
const { t, currentRoutes, localeIndex } = useI18n();

const text = computed(() => (response.value !== "mobile" ? t("nav.locale") : ""));

const curLabel = computed(() => currentRoutes.value[localeIndex.value].label);
const otherRoutes = computed(() => {
  return Object.entries(currentRoutes.value)
    .filter(([key, _]) => key !== localeIndex.value)
    .map(([_, item]) => item);
});

function switchTo(route: string) {
  window.location.href = route;
}
</script>

<template>
  <VtiNavMenu :text="text" icon="github">
    <VtiMenuButton :text="curLabel" />
    <VtiMenuDivider />
    <VtiMenuButton
      v-for="(item, i) in otherRoutes"
      :key="i"
      :text="item.label"
      @activate="() => switchTo(item.link)"
    />
  </VtiNavMenu>
</template>
