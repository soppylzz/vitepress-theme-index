import type { PropType } from "vue";
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from "vue";
import type { GiscusConfig } from "../../types";
import { useI18n, useTheme } from "../../composables";
import { useGiscusStyl } from "./styl";
import Giscus from "@giscus/vue";

function postGiscusStyl(iframe: HTMLIFrameElement, css: string) {
  if (!iframe) return;

  const base64 = btoa(unescape(encodeURIComponent(css)));
  const dataUrl = `data:text/css;base64,${base64}`;

  iframe.contentWindow.postMessage(
    {
      giscus: {
        setConfig: {
          theme: dataUrl,
        },
      },
    },
    "https://giscus.app"
  );
}

const VtiGiscus = defineComponent({
  name: "VtiGiscus",
  props: {
    ctx: Object as PropType<Omit<GiscusConfig, "type">>,
  },
  setup(props) {
    const { localeIndex } = useI18n();
    const { localeMap, ...resProps } = props.ctx;
    const lang = computed(() => localeMap[localeIndex.value]);

    const { ctx } = useTheme();

    const iframeRef = ref<HTMLIFrameElement | null>(null);
    const injected = ref(false);

    const { generateStyl } = useGiscusStyl();

    function resolveIframe() {
      const widget = document.querySelector("giscus-widget");
      iframeRef.value = widget?.shadowRoot?.querySelector("iframe") || null;
    }

    async function injectStyle() {
      if (!iframeRef.value) return;
      const css = await generateStyl();
      postGiscusStyl(iframeRef.value, css);
    }

    async function handleMessage(evt: MessageEvent) {
      if (evt.origin !== "https://giscus.app") return;
      if (!(typeof evt.data === "object" && evt.data.giscus)) return;

      if ("discussion" in evt.data.giscus && !injected.value) {
        resolveIframe();

        if (iframeRef.value) {
          injected.value = true;
          await injectStyle();
        }
      }
    }

    watch([() => ctx.mode, () => ctx.preset], async () => {
      if (injected.value) {
        // discussions?repo=soppylzz%2Fvitepress-theme-index&term=en%2Fguide%2Fmd-example&category=Announcemen…
        await injectStyle();
      }
    });

    onMounted(() => {
      window.addEventListener("message", handleMessage);
    });

    onUnmounted(() => {
      window.removeEventListener("message", handleMessage);
    });

    return () => <Giscus lang={lang.value} {...resProps} emitMetadata={"1"} />;
  },
});

export { VtiGiscus };
