import { ref } from "vue";
import { searchLogger } from "@vitepress-theme-index/shared";
import { debounce } from "lodash-unified";
import { useI18n } from "../use-i18n";
import type {
  SearchMode,
  SearchResult,
  WorkerRequestMessage,
  WorkerInitedResponse,
  WorkerSearchResponse,
} from "../../types";

function createWorker(mode: SearchMode) {
  switch (mode) {
    case "mini-search": {
      return new Worker(new URL("./mini-search.mjs", import.meta.url), { type: "module" });
    }
    default: {
      searchLogger.error(`unsupported search mode: ${mode}`);
    }
  }
}

let indexRecordCache: any = null;

async function loadIndex() {
  if (!indexRecordCache) {
    const mod = await import("virtual:index-search");
    indexRecordCache = mod.default;
  }
  return indexRecordCache;
}

function useSiteSearch(options?: { mode?: SearchMode; delay?: number }) {
  const { mode = "mini-search", delay = 300 } = options ?? {};

  const results = ref<SearchResult[]>([]);
  const loading = ref<boolean>(false);

  const { localeIndex } = useI18n();

  let worker: Worker | null = null;
  let initialized = false;
  let initPromise: Promise<void> | null = null;
  let lastInitializedLocale: string | null = null;

  async function init() {
    const locale = localeIndex.value;

    if (initialized && lastInitializedLocale === locale) return;
    if (!worker) worker = createWorker(mode);

    const indexRecord = await loadIndex();

    await new Promise<void>((resolve) => {
      const handler = (e: MessageEvent<WorkerInitedResponse>) => {
        if (e.data.type === "inited") {
          worker!.removeEventListener("message", handler);
          if (e.data.error) {
            searchLogger.error(`search init failed: ${e.data.error}`);
          }
          if (e.data.success) {
            initialized = true;
            lastInitializedLocale = locale;
          }
          resolve();
        }
      };

      worker!.addEventListener("message", handler);
      worker!.postMessage({ type: "init", locale, payload: indexRecord } as WorkerRequestMessage);
    });
  }

  let requestId = 0;

  async function doSearch(query: string): Promise<SearchResult[]> {
    if (!query) {
      results.value = [];
      return [];
    }
    loading.value = true;
    if (!initPromise) initPromise = init();
    await initPromise;

    const id = requestId++;

    results.value = await new Promise<SearchResult[]>((resolve) => {
      const handler = (e: MessageEvent<WorkerSearchResponse>) => {
        if (e.data.type === "result" && e.data.id === id) {
          worker!.removeEventListener("message", handler);
          if (e.data.error) {
            searchLogger.error(`search error: ${e.data.error}`);
            resolve([]);
          } else {
            resolve(e.data.payload);
          }
        }
      };

      worker!.addEventListener("message", handler);
      worker!.postMessage({
        type: "search",
        queryMode: mode,
        payload: query,
        id,
      } as WorkerRequestMessage);
    });
    loading.value = false;
    return results.value;
  }

  const search = debounce(doSearch, delay);
  return {
    search,
    loading,
    results,
  };
}

export { useSiteSearch };
