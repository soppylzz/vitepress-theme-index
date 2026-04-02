<script setup lang="ts">
import { useBem, useI18n, useIndex } from "../composables";
import { provideSubNavContext } from "./context";
import { computed } from "vue";

const { t } = useI18n();
const model = defineModel<boolean>({ default: false });

const { isExpand, closeToc, toggleToc } = provideSubNavContext();
function toggleMenu() {
  closeToc();
  model.value = true;
}

const { response } = useIndex().theme;

const ns = useBem("sub-nav");
const kls = computed(() => ({
  wrap: ns.b(),
  menu: ns.e("menu"),
  toc: ns.e("toc"),
  ctn: ns.e("toc-container"),
}));
</script>

<template>
  <div v-if="response !== 'computer'" :class="kls.wrap">
    <div v-if="response === 'mobile'" :class="kls.menu" @click="toggleMenu">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
        <!--! Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
        <path
          d="M201.4 297.4C188.9 309.9 188.9 330.2 201.4 342.7L361.4 502.7C373.9 515.2 394.2 515.2 406.7 502.7C419.2 490.2 419.2 469.9 406.7 457.4L269.3 320L406.6 182.6C419.1 170.1 419.1 149.8 406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3L201.3 297.3z"
        />
      </svg>
      <span>{{ t("sub-nav.menu") }}</span>
    </div>
    <div :class="kls.toc" @click="toggleToc">
      <span>{{ t("sub-nav.toc") }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
        <!--! Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
        <path
          d="M201.4 297.4C188.9 309.9 188.9 330.2 201.4 342.7L361.4 502.7C373.9 515.2 394.2 515.2 406.7 502.7C419.2 490.2 419.2 469.9 406.7 457.4L269.3 320L406.6 182.6C419.1 170.1 419.1 149.8 406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3L201.3 297.3z"
        />
      </svg>
    </div>
    <div v-if="isExpand" :class="kls.ctn"><slot /></div>
  </div>
</template>
