import type { PropType } from "vue";
import { computed, watch, defineComponent, nextTick, onUnmounted, ref, onMounted } from "vue";
import type { Header } from "vitepress";
import { useData } from "vitepress";
import { useBem, useLNav } from "../composables";
import type { IndexSize } from "../types";

const TOP_OFFSET = 80;

function flatHeaders(headers: Header[]): Omit<Header, "children">[] {
  return headers.reduce(
    (acc, header) => {
      const { children, ...rest } = header;
      acc.push(rest);
      if (children?.length) acc.push(...flatHeaders(children));
      return acc;
    },
    [] as Omit<Header, "children">[]
  );
}

function useTocActive() {
  const activeId = ref("");
  const isClickScrolling = ref(false);

  let scrollRaf: number | null = null;

  const setActive = (id: string) => {
    if (!id || activeId.value === id) return;
    activeId.value = id;
    history.replaceState(null, "", `#${id}`);
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    isClickScrolling.value = true;

    const targetTop = window.scrollY + el.getBoundingClientRect().top - TOP_OFFSET;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });

    const onScroll = () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);

      scrollRaf = requestAnimationFrame(() => {
        isClickScrolling.value = false;
        window.removeEventListener("scroll", onScroll);
      });
    };

    window.addEventListener("scroll", onScroll);
  };

  const onObserve = (visibleIds: string[]) => {
    if (isClickScrolling.value || !visibleIds.length) return;

    const sorted = visibleIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

    if (sorted.length) {
      setActive(sorted[0].id);
    }
  };

  return { activeId, scrollToId, onObserve };
}

const VtiToc = defineComponent({
  name: "VtiToc",
  props: {
    size: { type: String as PropType<IndexSize>, default: "medium" },
  },
  setup(props) {
    const { page } = useData();
    const ctx = useLNav();
    const ns = useBem("toc");

    const headers = computed(() => flatHeaders(page.value.headers || []));

    const { activeId, scrollToId, onObserve } = useTocActive();

    const observer = ref<IntersectionObserver | null>(null);
    const itemRefs = ref(new Map<string, HTMLElement>());

    const sliderStyle = ref({
      transform: "translateY(0)",
      height: "0",
      opacity: "0",
    });

    let rafId: number | null = null;

    const updateSlider = () => {
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const el = itemRefs.value.get(activeId.value);
        if (!el) return;

        sliderStyle.value = {
          transform: `translateY(${el.offsetTop}px)`,
          height: `${el.offsetHeight}px`,
          opacity: "1",
        };
      });
    };

    const initObserver = () => {
      observer.value?.disconnect();

      const elements = headers.value
        .map((h) => document.getElementById(h.slug))
        .filter((el): el is HTMLElement => el !== null);

      if (!elements.length) return;

      observer.value = new IntersectionObserver(
        (entries) => {
          const visibleIds: string[] = [];

          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleIds.push(entry.target.id);
            }
          });

          if (visibleIds.length) {
            onObserve(visibleIds);
          }
        },
        {
          rootMargin: `-${TOP_OFFSET}px 0px -70% 0px`,
          threshold: 0,
        }
      );

      elements.forEach((el) => observer.value?.observe(el));
    };

    const handleResize = () => {
      requestAnimationFrame(updateSlider);
    };

    watch(activeId, async () => {
      await nextTick();
      updateSlider();
    });

    onMounted(() => {
      watch(
        () => headers.value,
        async () => {
          await nextTick();
          initObserver();
          updateSlider();
        },
        { immediate: true, flush: "post" }
      );
      window.addEventListener("resize", handleResize);
    });

    onUnmounted(() => {
      observer.value?.disconnect();
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    });

    return () => (
      <div class={[ns.b(), ns.m(props.size)]}>
        {headers.value.map((h) => (
          <a
            key={h.slug}
            ref={(el: any) =>
              el ? itemRefs.value.set(h.slug, el as HTMLElement) : itemRefs.value.delete(h.slug)
            }
            onClick={(e: MouseEvent) => {
              e.preventDefault();
              if (ctx && ctx.type === "docs") {
                ctx.closeToc();
              }
              scrollToId(h.slug);
            }}
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
        <div class={ns.e("slider")} style={sliderStyle.value}></div>
      </div>
    );
  },
});

export { VtiToc };
