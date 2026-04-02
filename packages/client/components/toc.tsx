import type { PropType } from "vue";
import { defineComponent, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useData } from "vitepress";
import { useBem } from "../composables";
import type { IndexSize } from "../types";
import { useSubNav } from "./context";

const VtiToc = defineComponent({
  name: "VtiToc",
  props: {
    size: {
      type: String as PropType<IndexSize>,
      default: "medium",
    },
  },
  setup(props) {
    const { page } = useData();

    const activeId = ref("");
    const observer = ref<IntersectionObserver | null>(null);
    const tocItems = ref<HTMLElement[]>([]);
    const sliderStyle = ref<{ top?: string; height?: string }>({});

    const headers = page.value.headers;
    const ns = useBem("toc");

    function setActive(id: string) {
      activeId.value = id;
      history.replaceState(null, "", `#${id}`);
    }

    async function updateSliderPosition() {
      await nextTick();
      if (!activeId.value) return;

      const activeEl = tocItems.value.find(
        (el) => el.getAttribute("href") === `#${activeId.value}`
      );
      if (!activeEl) return;

      sliderStyle.value = {
        top: `${activeEl.offsetTop}px`,
        height: `${activeEl.offsetHeight}px`,
      };
    }

    const ctx = useSubNav();
    const handleClick = !ctx
      ? () => {}
      : () => {
          ctx.closeToc();
        };

    onMounted(async () => {
      const elements = headers
        .map((h) => document.getElementById(h.slug))
        .filter(Boolean) as HTMLElement[];

      observer.value = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActive(entry.target.id);
            }
          });
        },
        {
          rootMargin: "-40% 0px -55% 0px",
          threshold: 0,
        }
      );

      elements.forEach((el) => observer.value?.observe(el));
      await nextTick();
      tocItems.value = Array.from(document.querySelectorAll(`.${ns.e("item")}`)) as HTMLElement[];
      await updateSliderPosition();
    });

    onUnmounted(() => {
      observer.value?.disconnect();
    });

    return () => (
      <div class={[ns.b(), ns.m(props.size)]}>
        {/* dynamic slide */}
        <div class={ns.e("slider")} style={sliderStyle.value}></div>
        {headers.map((header) => (
          <a
            key={header.slug}
            href={header.link}
            onClick={handleClick}
            class={[
              ns.e("item"),
              ns.em("item", `${props.size}`),
              ns.em("item", `level-${header.level}`),
              ns.when("active", activeId.value === header.slug),
            ]}
          >
            {header.title}
          </a>
        ))}
      </div>
    );
  },
});

export { VtiToc };
