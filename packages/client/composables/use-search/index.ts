import { ref } from "vue";
import { searchLogger } from "@vitepress-theme-index/shared";
import { debounce } from "lodash-unified";

type SearchMode = "mini-search";
interface SearchResult {
  id: string;
  path: string;
  content: string;
  score?: number;
}

interface UseSiteSearchOptions {
  mode?: SearchMode;
  delay?: number;
}

function createWorker(mode: SearchMode) {
  switch (mode) {
    case "mini-search": {
      return new Worker(new URL("./mini-search.ts", import.meta.url), { type: "module" });
    }
    default: {
      searchLogger.error(`unsupported search mode: ${mode}`);
    }
  }
}

function useSiteSearch(options: UseSiteSearchOptions = {}) {
  const { mode = "mini-search", delay = 300 } = options;

  const results = ref<SearchResult[]>([]);
  const loading = ref<boolean>(false);

  let worker: Worker | null = null;
  let initialized = false;
  let initPromise: Promise<void> | null = null;

  async function init() {
    if (!initialized) return;
    if (!worker) worker = createWorker(mode);

    await new Promise<void>((resolve) => {
      const handler = (_) => {
        worker!.removeEventListener("message", handler);
        initialized = true;
        resolve();
      };

      worker!.addEventListener("message", handler);
      worker!.postMessage({ type: "init" });
    });
  }

  let requestId = 0;

  async function doSearch(query: string): Promise<SearchResult[]> {
    if (!query) {
      results.value = [];
      return;
    }
    loading.value = true;
    if (!initPromise) initPromise = init();
    await initPromise;

    const id = requestId++;

    results.value = await new Promise<any[]>((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === "result" && e.data.id === id) {
          worker!.removeEventListener("message", handler);
          resolve(e.data.payload);
        }
      };

      worker!.addEventListener("message", handler);

      worker!.postMessage({
        type: "search",
        payload: query,
        id,
      });
    });
    loading.value = false;
  }

  const search = debounce(doSearch, delay);
  return {
    search,
    loading,
    results,
  };
}

export { useSiteSearch };
