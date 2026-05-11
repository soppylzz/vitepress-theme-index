import type {
  IndexSearchConfig,
  SearchHistoryCache,
  SearchHistoryItem,
  SearchInitProtocol,
  SearchMainProtocol,
  SearchMode,
  UseSearchOptions,
} from "../../types";
import { indexSearchStoreKey } from "../../types";
import type { DeepPartial, SearchIndexItem } from "@vitepress-theme-index/shared";
import { searchLogger } from "@vitepress-theme-index/shared";
import { computed, onMounted, readonly, ref } from "vue";
import { useI18n } from "../use-i18n";
import { useRouter } from "vitepress";
import { getLocalStorage, setLocalStorage } from "../../utils";
import { useGlobal } from "../use-index";
import { debounce } from "lodash-unified";

class SearchWorkerManager {
  private static instance: SearchWorkerManager;

  private initId: number = 0;
  private searchId: number = 0;
  private initPromise: Promise<void> | null = null;

  private isInited: boolean = false;
  private mode: SearchMode | null = null;
  private worker: Worker | null = null;

  private indexCache: any = null;
  private timeout: number = 0;

  static getInstance(): SearchWorkerManager {
    if (!SearchWorkerManager.instance) {
      SearchWorkerManager.instance = new SearchWorkerManager();
    }
    return SearchWorkerManager.instance;
  }

  private resolveWorker() {
    if (this.worker) return;

    switch (this.mode) {
      case "mini-search": {
        this.worker = new Worker(new URL("./mini-search.mjs", import.meta.url), {
          type: "module",
        });
        break;
      }
      default: {
        searchLogger.error(`unsupported search mode: ${this.mode}`);
      }
    }
  }

  async init<MODE extends SearchMode>(
    options: Omit<UseSearchOptions<MODE>, "delay"> & Pick<IndexSearchConfig<MODE>, "config">
  ): Promise<void> {
    const { mode, timeout, config } = options;
    this.timeout = timeout;

    if (this.isInited && this.mode === mode) return;

    if (this.mode !== mode) {
      this.reset();
      this.mode = mode;
    }

    this.resolveWorker();
    if (this.initPromise) return this.initPromise;

    if (["mini-search"].includes(mode)) {
      if (!this.indexCache) {
        this.indexCache = (await import("virtual:index-search")).default;
      }
    }

    this.initPromise = new Promise<void>((resolve, reject) => {
      const currentId = this.initId;
      const timeoutId = setTimeout(() => {
        this.worker.removeEventListener("message", handler);
        reject(new Error(`init timeout error: ${mode}`));
      }, this.timeout);

      const handler = (e: MessageEvent<SearchInitProtocol<MODE>["response"]>) => {
        if (e.data.type !== "init" || e.data.id !== currentId) return;

        this.worker.removeEventListener("message", handler);
        clearTimeout(timeoutId);

        if (currentId !== this.initId) {
          resolve();
          return;
        }

        if (!e.data.success) {
          this.isInited = false;
          reject(new Error(`search init failed: ${e.data?.message || "unknown error"}`));
        } else {
          this.isInited = true;
          resolve();
        }
      };
      this.worker.addEventListener("message", handler);

      const post: Partial<SearchInitProtocol<MODE>["request"]> = {
        mode,
        type: "init",
        id: currentId,
        timestamp: Date.now(),
      };
      switch (mode) {
        case "mini-search": {
          post.payload = { index: this.indexCache, init: config };
          break;
        }
        default: {
          searchLogger.error(`unsupported search mode: ${mode}`);
        }
      }

      this.worker.postMessage(post);
    }).finally(() => {
      this.initPromise = null;
      this.initId++;
    });
    return this.initPromise;
  }

  async search<MODE extends SearchMode>(options: SearchMainProtocol<MODE>["request"]["payload"]) {
    if (!this.worker || !this.isInited) {
      searchLogger.error(`worker not initialized`);
    }

    return new Promise<SearchIndexItem[]>((resolve, reject) => {
      const searchId = this.searchId++;
      const timeoutId = setTimeout(() => {
        this.worker.removeEventListener("message", handler);
        reject(new Error(`search timeout error: ${this.mode}`));
      }, this.timeout);

      const handler = (e: MessageEvent<SearchMainProtocol<MODE>["response"]>) => {
        if (e.data.type !== "search" || e.data.id !== searchId) return;

        this.worker.removeEventListener("message", handler);
        clearTimeout(timeoutId);

        if (e.data.success) {
          resolve(e.data.payload.results);
        } else {
          reject(new Error(`search failed by ${this.mode}`));
        }
      };
      this.worker.addEventListener("message", handler);
      this.worker.postMessage({
        type: "search",
        id: searchId,
        mode: this.mode,
        timestamp: Date.now(),
        payload: options,
      });
    });
  }

  reset() {
    this.mode = null;
    this.isInited = false;
    this.initPromise = null;
    this.initId++;
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

const searcher = SearchWorkerManager.getInstance();

const isOpen = ref(false);
const historyCache = ref<SearchHistoryCache>({});

function useSearch() {
  const loading = ref(false);

  const router = useRouter();
  const { localeIndex } = useI18n();
  const histories = computed(() => historyCache.value?.[localeIndex.value] ?? []);
  const { config, delay, timeout, mode } = useGlobal().search;

  type SearchConfig = Parameters<typeof searcher.search>[0];

  const search = debounce(async (query: DeepPartial<Omit<SearchConfig, "locale">>) => {
    let resolvedQuery: null | SearchConfig = null;

    switch (mode) {
      case "mini-search": {
        resolvedQuery = {
          locale: localeIndex.value,
          sortKey: query?.sortKey ?? "score",
          query: query.query ?? "",
        };
        break;
      }
      default: {
        searchLogger.error(`unsupported search mode: ${mode}`);
      }
    }

    loading.value = true;
    try {
      await searcher.init({ mode, timeout, config });
      return await searcher.search(resolvedQuery);
    } finally {
      loading.value = false;
    }
  }, delay);

  onMounted(() => {
    historyCache.value = getLocalStorage(indexSearchStoreKey);
  });

  async function use(target: SearchIndexItem | SearchHistoryItem) {
    await router.go(target.path);

    const item: SearchHistoryItem = { searcher: mode, ...target, timestamp: Date.now() };
    const histories = historyCache.value[localeIndex.value].filter((item) => item.id !== target.id);

    historyCache.value[localeIndex.value] = [item, ...histories];
    setLocalStorage(indexSearchStoreKey, historyCache.value);
  }

  return {
    use,
    search,
    loading: readonly(loading),
    histories: readonly(histories),
  };
}

function useSearchState() {
  const open = () => {
    isOpen.value = true;
  };
  const close = () => {
    isOpen.value = false;
  };

  return {
    open,
    close,
    isOpen: readonly(isOpen),
  };
}

export { useSearch, useSearchState };
