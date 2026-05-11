<script setup lang="ts">
import {
  useBem,
  useI18n,
  useTheme,
  useSearch,
  useSearchState,
  useIcon,
  useGlobal,
  cssVarName,
  useLockScroll,
} from "../../composables";
import { computed, onMounted, reactive, ref, shallowRef, watch } from "vue";
import type { SearchIndexItem } from "@vitepress-theme-index/shared";
import type { MiniMainRequest, SearchHelpItem, SearchMode } from "../../types";

import VtiLoading from "./loading.vue";
import VtiHelp from "./help.vue";

function getHelps(hasTitle: boolean) {
  return [
    hasTitle && { type: "title", help: (t) => t("search.help.head") },
    { type: "key", keys: ["↑", "↓"], help: (t) => t("search.help.nav") },
    { type: "key", keys: "esc", help: (t) => t("search.help.close") },
    { type: "key", keys: "⌘+k", help: (t) => t("search.help.open") },
  ].filter(Boolean) as SearchHelpItem[];
}

const searchBadges: Record<SearchMode, Record<"name" | "logo" | "href", string> | null> = {
  "mini-search": {
    logo: "npm",
    name: "lucaong/minisearch",
    href: "https://www.npmjs.com/package/minisearch",
  },
};

const { t } = useI18n();
const { response, ctx } = useTheme();

const sortKey = ref<MiniMainRequest["sortKey"]>("score");
const searchText = ref("");

const { search, use, histories, loading } = useSearch();
const { isOpen, close } = useSearchState();
const { mode } = useGlobal().search;

const results = ref<SearchIndexItem[]>([]);
const boxRef = shallowRef<HTMLElement | null>(null);

const badgeRef = shallowRef<HTMLElement | null>(null);
const badge = reactive({ href: "", src: "", alt: "" });

const state = computed<"loading" | "history" | "search" | "empty">(() => {
  if (loading.value) return "loading";
  if (results.value.length !== 0) return "search";
  if (histories.value.length !== 0) return "history";
  return "empty";
});

function clickOverlay(e: MouseEvent) {
  const box = boxRef.value;
  if (box && !box.contains(e.target as Node)) {
    close();
  }
}

async function doSearch() {
  results.value =
    (await search({
      query: searchText.value,
      sortKey: sortKey.value,
    })) ?? [];
}

onMounted(() => {
  watch(
    [() => ctx.mode, () => ctx.preset, () => badgeRef.value],
    () => {
      if (!badgeRef.value) return;
      const accent = getComputedStyle(badgeRef.value)
        .getPropertyValue(cssVarName(["accent", "base"]))
        .replace("#", "");

      const badgeCtx = searchBadges[mode];
      if (!badgeCtx) return;

      Object.assign(badge, {
        href: badgeCtx.href,
        src: `https://img.shields.io/badge/${encodeURI(badgeCtx.name)}-${accent}?logo=${encodeURI(badgeCtx.logo)}`,
        alt: mode,
      });
    },
    { flush: "post", immediate: true }
  );
  useLockScroll(isOpen, document.body);
});

const boxStyl = computed(() =>
  response.value !== "mobile" ? { width: `${ctx.breakPoint[0]}px` } : {}
);

const IconClose = useIcon("x");
const IconSearch = useIcon("magnifying-glass");
const ns = useBem("search");
const kls = computed(() => ({
  wrap: ns.b(),
  box: [ns.e("box"), ns.em("box", response.value)],
  header: ns.e("header"),
  main: ns.e("main"),
  help: ns.e("help"),
  bg: ns.e("bg"),
  footer: ns.e("footer"),
}));
</script>

<template>
  <div v-if="isOpen" :class="kls.wrap" @mousedown="clickOverlay">
    <div ref="boxRef" :class="kls.box" :style="boxStyl">
      <div :class="kls.header">
        <IconSearch />
        <input v-model="searchText" :placeholder="t('search.placeholder')" @input="doSearch" />
        <button @click="close">ESC</button>
      </div>
      <div :class="kls.main">
        <div :class="kls.bg">
          <VtiHelp :helps="getHelps(true)" />
          <!--          <VtiLoading :text="t('search.loading')" icon="spinner" />-->
        </div>

        <!--        <Loading v-if="state === 'loading'" :text="t('search.loading')" icon="spinner" />-->
        <!--        <template v-else-if="state === 'history'">-->
        <!--          &lt;!&ndash;  temp  &ndash;&gt;-->
        <!--        </template>-->
        <!--        <template v-else-if="state === 'search'">-->
        <!--          &lt;!&ndash;  temp  &ndash;&gt;-->
        <!--        </template>-->
        <!--        <div v-else>-->
        <!--          <Help container="main" :helps="searchHelps" />-->
        <!--        </div>-->
      </div>
      <div :class="kls.footer">
        <VtiHelp v-show="state === 'empty'" size="small" direction="row" :helps="getHelps(false)" />
        <a v-if="['mini-search'].includes(mode)" ref="badgeRef" :href="badge.href" target="_blank">
          {{ t("search.powered") }}
          <img :src="badge.src" :alt="badge.alt" />
        </a>
      </div>
    </div>
  </div>
</template>
