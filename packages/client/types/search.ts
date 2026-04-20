import type { SearchIndexItem } from "@vitepress-theme-index/shared";

type SearchMode = "mini-search";

type SearchResult = SearchIndexItem & {
  score?: number;
};

type WorkerInitRequest = {
  type: "init";
  locale: string;
};

type WorkerSearchRequest = {
  type: "search";
  queryMode?: string;
  payload: string;
  id: number;
};

type WorkerRequestMessage = WorkerInitRequest | WorkerSearchRequest;

type WorkerInitedResponse = {
  type: "inited";
  success: boolean;
  error?: string;
};

type WorkerSearchResponse = {
  type: "result";
  id: number;
  error?: string;
  payload: SearchResult[];
};

type WorkerResponseMessage = WorkerInitedResponse | WorkerSearchResponse;

export type {
  SearchResult,
  SearchMode,
  WorkerInitRequest,
  WorkerSearchRequest,
  WorkerRequestMessage,
  WorkerInitedResponse,
  WorkerSearchResponse,
  WorkerResponseMessage,
};
