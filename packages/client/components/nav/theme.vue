<script setup lang="ts">
import { computed } from "vue";
import { useBem, useI18n, useTheme } from "../../composables";
import type { NavContainer } from "../../types";
import VtiNavMenu from "./menu.vue";
import { VtiTheme } from "../public";

const props = withDefaults(defineProps<{ container?: NavContainer }>(), {
  container: "header",
});
const { response } = useTheme();
const { t } = useI18n();

const text = computed(() => (response.value === "desktop" ? t("nav.theme") : ""));

const ns = useBem("nav-theme");
</script>

<template>
  <VtiNavMenu v-if="props.container === 'header'" :text="text" icon="github">
    <VtiTheme size="small" direction="col" />
  </VtiNavMenu>
  <div v-else-if="props.container === 'screen'" :class="ns.b()">
    <VtiTheme size="small" direction="row" />
  </div>
</template>
