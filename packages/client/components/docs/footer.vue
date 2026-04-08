<script setup lang="ts">
import { useBem, useI18n, useLink, useSite, useText, useTheme } from "../../composables";
import { computed } from "vue";

const { t } = useI18n();
const { owner, beian, build } = useSite();
const { response } = useTheme();

const ownerAttr = useLink(owner).attr;
const beianAttr = useLink(beian).attr;

const ns = useBem("docs-footer");
const kls = computed(() => ({
  wrap: [ns.b(), ns.m(response.value)],
  info: [ns.e("info"), ns.em("info", response.value)],
  function: [ns.e("function"), ns.em("function", response.value)],
}));
</script>

<template>
  <div :class="kls.wrap">
    <div :class="kls.info">
      <span v-if="owner"
        >{{ t("docs.footer.owner") }} <a v-bind="ownerAttr">{{ useText(owner.text) }}</a> @
        {{ new Date(build).getFullYear() }} - {{ new Date().getFullYear() }}</span
      >
      <span
        >{{ t("docs.footer.theme") }}
        <a href="https://github.com/soppylzz/vitepress-theme-index" target="_blank"
          >vitepress-theme-index</a
        ></span
      >
    </div>
    <div :class="kls.function">
      <!--  beian:default button  -->
      <a v-if="beian" v-bind="beianAttr">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
          <path
            d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"
          />
        </svg>
        {{ useText(beian.text) }}
      </a>
    </div>
  </div>
</template>
