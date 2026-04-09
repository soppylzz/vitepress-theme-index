import type { PropType } from "vue";
import { computed, watch, defineComponent, nextTick, onUnmounted, ref } from "vue";
import type { Header } from "vitepress";
import { useData } from "vitepress";
import { useBem } from "../composables";
import type { IndexSize } from "../types";
import { useSubNav } from "./context";
import { debounce, omit } from "lodash-unified";

function flatHeaders(headers: Header[]) {
  const flatArr: Omit<Header, "children">[] = [];

  function traverse(header: Header) {
    flatArr.push(omit({ ...header }, "children"));
    if ("children" in header && header.children.length) {
      header.children.forEach(traverse);
    }
  }

  headers.forEach(traverse);
  return flatArr;
}

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
    const ctx = useSubNav();
    const ns = useBem("toc");

    const activeId = ref("");
    const observer = ref<IntersectionObserver | null>(null);
    const tocItems = ref<HTMLElement[]>([]);
    const sliderStyle = ref<{ top?: string; height?: string; opacity?: string }>({ opacity: "0" });

    const isClicking = ref(false);
    const onScrollEnd = debounce(() => {
      isClicking.value = false;
      window.removeEventListener("scroll", handleScroll);
    }, 100);
    const handleScroll = () => onScrollEnd();

    const headers = computed(() => flatHeaders(page.value.headers));

    function setActive(id: string) {
      if (activeId.value === id) return;
      activeId.value = id;
      history.replaceState(null, "", `#${id}`);
    }

    watch(activeId, async () => {
      sliderStyle.value = { opacity: "0" };

      await nextTick();
      if (!activeId.value) return;
      const activeEl = tocItems.value.find(
        (el) => el.getAttribute("href") === `#${activeId.value}`
      );
      if (!activeEl) return;
      sliderStyle.value = {
        top: `${activeEl.offsetTop}px`,
        height: `${activeEl.offsetHeight}px`,
        opacity: "1",
      };
    });

    const handleClick = async (e: MouseEvent, slug: string) => {
      ctx?.closeToc?.();
      isClicking.value = true;
      activeId.value = slug;

      window.removeEventListener("scroll", handleScroll);
      window.addEventListener("scroll", handleScroll);

      onScrollEnd();
    };

    const initObserver = async () => {
      if (observer.value) {
        observer.value.disconnect();
      }

      await nextTick();
      const elements = headers.value
        .map((h) => document.getElementById(h.slug))
        .filter(Boolean) as HTMLElement[];

      if (!elements.length) return;
      const visibleEntries = new Set<string>();

      observer.value = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleEntries.add(entry.target.id);
            } else {
              visibleEntries.delete(entry.target.id);
            }
          });

          if (isClicking.value) return;
          const activeHeader = headers.value.find((h) => visibleEntries.has(h.slug));
          if (activeHeader) {
            setActive(activeHeader.slug);
          }
        },
        {
          rootMargin: "0px 0px -60% 0px",
          threshold: 0,
        }
      );

      elements.forEach((el) => observer.value?.observe(el));

      await nextTick();
      tocItems.value = Array.from(document.querySelectorAll(`.${ns.e("item")}`)) as HTMLElement[];

      if (!activeId.value && headers.value.length > 0) {
        setActive(headers.value[0].slug);
      }
    };

    watch(
      () => headers.value,
      () => {
        setTimeout(initObserver, 100);
      },
      { immediate: true }
    );

    onUnmounted(() => {
      observer.value?.disconnect();
      window.removeEventListener("scroll", handleScroll);
      onScrollEnd.cancel();
    });

    return () => (
      <div class={[ns.b(), ns.m(props.size)]}>
        {headers.value.map((h) => (
          <a
            key={h.slug}
            href={h.link}
            onClick={(e: MouseEvent) => handleClick(e, h.slug)}
            class={[
              ns.e("item"),
              ns.em("item", `${props.size}`),
              ns.em("item", `level-${h.level}`),
              ns.when("active", activeId.value === h.slug),
            ]}
          >
            {h.title}
          </a>
        ))}
        {/* dynamic slide */}
        <div class={ns.e("slider")} style={sliderStyle.value}></div>
      </div>
    );
  },
});

export { VtiToc };
