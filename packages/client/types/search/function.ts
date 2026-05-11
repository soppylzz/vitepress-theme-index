import type { SearchIndexItem } from "@vitepress-theme-index/shared";
import type { SearchMode } from "./base";

type SearchHistoryItem = SearchIndexItem & {
  searcher: SearchMode;
  timestamp: number;
};

type SearchHistoryCache = Record<string, SearchHistoryItem[]>;

interface UseSearchOptions<MODE extends SearchMode> {
  mode: MODE;
  delay: number;
  timeout: number;
}

export type { UseSearchOptions, SearchHistoryItem, SearchHistoryCache };
