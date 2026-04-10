<script setup lang="ts">
import { useBem, useI18n, useLink, usePost, useSite, useText, useShare } from "../../composables";
import { useData } from "vitepress";
import { computed, onMounted, ref, shallowRef } from "vue";
import QRCode from "qrcode";

const { firstCommit, lastCommit } = usePost();
const { frontmatter } = useData();
const { license } = useSite();
const { t, d } = useI18n();

const licenseAttr = useLink(() => frontmatter.value?.["license"] ?? license?.value ?? {}).attr;
const licenseText = computed(() => {
  const matterText = frontmatter.value?.["license"]?.["text"];
  return matterText || useText(license?.value?.text);
});

const isExpand = ref(false);
const qrContainer = shallowRef<HTMLElement | null>(null);

onMounted(() => {
  if (!qrContainer.value) return;
  QRCode.toCanvas(qrContainer.value, window.location.href, { width: 200 });
});

const ns = useBem("docs-card");
const kls = computed(() => ({
  wrap: ns.b(),
  times: ns.e("times"),
  quick: ns.e("quick"),
  license: ns.e("license"),
  share: ns.e("share"),
}));

function toggleQrcode() {
  isExpand.value = !isExpand.value;
}

const { shareToMail, copyLink } = useShare();
</script>

<template>
  <div :class="kls.wrap">
    <div :class="kls.times">
      <span>{{ t("docs.card.firstUpdate") }} {{ d(firstCommit, "date") }}</span>
      <span>{{ t("docs.card.lastUpdate") }} {{ d(lastCommit, "date") }}</span>
    </div>
    <div :class="kls.quick">
      <slot name="vti-docs-card-quick">
        <a>quick test</a>
      </slot>
    </div>
    <div :class="kls.license">
      {{ t("docs.card.license") }} <a v-bind="licenseAttr">{{ licenseText }}</a>
      <div>
        <svg
          id="wechat"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          @click="toggleQrcode"
        >
          <!--! Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
          <path
            d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z"
          />
        </svg>
        <svg
          id="email"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          @click="shareToMail"
        >
          <!--! Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
          <path
            d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z"
          />
        </svg>
        <svg id="link" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" @click="copyLink">
          <!--! Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
          <path
            d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z"
          />
        </svg>
      </div>
    </div>
    <div v-show="isExpand">
      <canvas ref="qrContainer" />
    </div>
  </div>
</template>
