<script setup lang="ts">
import { provideLNavDocs, useBem, useI18n, useLayout, useTheme } from "../../composables";
import { computed } from "vue";

const { t } = useI18n();
const model = defineModel<boolean>({ default: false });

const { isExpand, closeToc, toggleToc } = provideLNavDocs();
function toggleMenu() {
  closeToc();
  model.value = true;
}

const { response } = useTheme();
const { hasToc } = useLayout();

const ns = useBem("l-nav-docs");
const kls = computed(() => ({
  wrap: [ns.b(), ns.m(response.value)],
  button: [ns.e("button"), ns.em("button", response.value)],
  toc: [ns.e("toc"), ns.em("toc", response.value)],
}));
</script>

<template>
  <div v-if="response === 'mobile' || (response === 'pad' && hasToc)" :class="kls.wrap">
    <div v-if="response === 'mobile'" :class="kls.button" @click="toggleMenu">
      <span>{{ t("nav.menu") }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
        <!--! Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
        <path
          d="M201.4 297.4C188.9 309.9 188.9 330.2 201.4 342.7L361.4 502.7C373.9 515.2 394.2 515.2 406.7 502.7C419.2 490.2 419.2 469.9 406.7 457.4L269.3 320L406.6 182.6C419.1 170.1 419.1 149.8 406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3L201.3 297.3z"
        />
      </svg>
    </div>
    <div v-if="hasToc">
      <div :class="kls.button" @click="toggleToc">
        <span>{{ t("nav.toc") }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <!--! Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
          <path
            d="M201.4 297.4C188.9 309.9 188.9 330.2 201.4 342.7L361.4 502.7C373.9 515.2 394.2 515.2 406.7 502.7C419.2 490.2 419.2 469.9 406.7 457.4L269.3 320L406.6 182.6C419.1 170.1 419.1 149.8 406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3L201.3 297.3z"
          />
        </svg>
      </div>
      <div v-if="isExpand" :class="kls.toc">
        <div><slot /></div>
      </div>
    </div>
  </div>
</template>
