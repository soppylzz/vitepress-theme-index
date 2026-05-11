import type { LocaleSearchIndexRecord, SearchIndexItem } from "@vitepress-theme-index/shared";
import type { Options as MiniSearchOptions } from "minisearch";

/* =============== search protocol =============== */
interface BaseMainRes {
  results?: SearchIndexItem[];
}

type MiniInitConfig = Partial<Omit<MiniSearchOptions, "fields" | "storeFields">>;

interface MiniInitRequest {
  index: LocaleSearchIndexRecord;
  init: MiniInitConfig;
}

interface MiniMainRequest {
  query: string;
  locale: string;
  sortKey: "score" | "id";
}

interface PayloadRegistry {
  "mini-search": {
    init: { request: MiniInitRequest; response: never };
    search: { request: MiniMainRequest; response: BaseMainRes };
  };
}

type SearchMode = keyof PayloadRegistry;
type ProtocolType = "init" | "search";

interface BaseRequest<Type extends ProtocolType, Payload = never> {
  type: Type;
  id: number;
  payload?: Payload;
  timestamp: number;
}

interface BaseResponse<Type extends ProtocolType, Payload = never> {
  type: Type;
  id: number;
  payload?: Payload;
  success: boolean;
  message?: string;
  timestamp: number;
}

type BuildProtocol<Mode extends SearchMode, Type extends ProtocolType> = {
  request: BaseRequest<Type, PayloadRegistry[Mode][Type]["request"]> & { mode: Mode };
  response: BaseResponse<Type, PayloadRegistry[Mode][Type]["response"]>;
};

type SearchInitProtocol<MODE extends SearchMode> = BuildProtocol<MODE, "init">;
type SearchMainProtocol<MODE extends SearchMode> = BuildProtocol<MODE, "search">;

/* =============== global config =============== */
type IndexSearchConfig<MODE extends SearchMode = SearchMode> = {
  mode: MODE;
  config: { "mini-search": MiniInitConfig }[MODE];
  timeout: number;
  delay: number;
};

export type {
  SearchMode,
  BaseRequest,
  BaseResponse,
  ProtocolType,
  PayloadRegistry,
  MiniInitConfig,
  MiniMainRequest,
  SearchInitProtocol,
  SearchMainProtocol,
  IndexSearchConfig,
};
