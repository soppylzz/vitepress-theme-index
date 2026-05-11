import type { PropType } from "vue";
import { onBeforeUnmount, onMounted, computed, defineComponent, ref, watch } from "vue";
import type { GiscusConfig } from "../../types";
import { useI18n, useTheme } from "../../composables";
import { useGiscusStyl } from "./styl";
import Giscus from "@giscus/vue";
import { useRoute } from "vitepress";

function injectGiscusStyle(iframe: HTMLIFrameElement | null, css: string): void {
  if (!iframe?.contentWindow) return;

  const base64 = btoa(unescape(encodeURIComponent(css)));
  const dataUrl = `data:text/css;base64,${base64}`;

  iframe.contentWindow.postMessage(
    {
      giscus: {
        setConfig: { theme: dataUrl },
      },
    },
    "https://giscus.app"
  );
}

function resolveGiscusIframe(): HTMLIFrameElement | null {
  const widget = document.querySelector("giscus-widget");
  return widget?.shadowRoot?.querySelector("iframe") || null;
}

function isGiscusMessage(evt: MessageEvent): boolean {
  return (
    evt.origin === "https://giscus.app" &&
    typeof evt.data === "object" &&
    evt.data?.giscus !== undefined
  );
}

const VtiGiscus = defineComponent({
  name: "VtiGiscus",
  props: {
    ctx: Object as PropType<Omit<GiscusConfig, "type">>,
  },
  setup(props) {
    const { localeIndex } = useI18n();
    const { localeMap, fontMap, ...resProps } = props.ctx;
    const lang = computed(() => localeMap[localeIndex.value]);

    const route = useRoute();
    const { ctx } = useTheme();
    const { generateStyl } = useGiscusStyl();

    const iframeRef = ref<HTMLIFrameElement | null>(null);
    const injectedPath = ref<string | null>(null);

    async function injectStyle() {
      const iframe = resolveGiscusIframe();
      if (!iframe) return;

      iframeRef.value = iframe;
      const css = await generateStyl(fontMap, ctx.preset);
      injectGiscusStyle(iframe, css);
      injectedPath.value = route.path;
    }

    async function handleMessage(evt: MessageEvent) {
      if (!isGiscusMessage(evt)) return;
      if (injectedPath.value === route.path) return;
      await injectStyle();
    }

    watch(
      () => route.path,
      () => {
        injectedPath.value = null;
      },
      { flush: "pre" }
    );

    onMounted(() => {
      window.addEventListener("message", handleMessage);
      watch(
        [() => ctx.mode, () => ctx.preset],
        async () => {
          await injectStyle();
        },
        { flush: "post" }
      );
    });
    onBeforeUnmount(() => {
      window.removeEventListener("message", handleMessage);
    });

    return () => <Giscus lang={lang.value} {...resProps} emitMetadata="1" key={route.path} />;
  },
});

export { VtiGiscus };
