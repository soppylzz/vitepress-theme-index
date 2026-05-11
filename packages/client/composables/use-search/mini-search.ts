import MiniSearch from "minisearch";
import type { MiniInitConfig, SearchInitProtocol, SearchMainProtocol } from "../../types";
import type { LocaleSearchIndexRecord, SearchIndexItem } from "@vitepress-theme-index/shared";
import { pick } from "lodash-unified";

type MiniInitProto = SearchInitProtocol<"mini-search">;
type MiniMainProto = SearchMainProtocol<"mini-search">;

let indexCache: LocaleSearchIndexRecord | null = null;
let initConfig: MiniInitConfig | null = null;
const localeCache = new Map<string, { searcher: MiniSearch }>();

self.onmessage = async (e: MessageEvent<(MiniInitProto | MiniMainProto)["request"]>) => {
  const { type, payload, id } = e.data;

  switch (type) {
    case "init": {
      const response: Partial<MiniInitProto["response"]> = {
        id,
        type: "init",
        timestamp: Date.now(),
        success: false,
      };

      if (!payload?.index) {
        response.message = "invalid index payload";
        self.postMessage(response);
        return;
      }

      indexCache = payload.index;
      initConfig = payload.init;

      localeCache.clear();
      response.success = true;
      self.postMessage(response);
      break;
    }
    case "search": {
      const response: Partial<MiniMainProto["response"]> = {
        id,
        type: "search",
        timestamp: Date.now(),
        success: false,
      };
      const { locale, query, sortKey = "score" } = payload;

      if (!indexCache || !indexCache[locale]) {
        response.message = "locale searcher is missing";
        self.postMessage(response);
        return;
      }

      const cached = localeCache.get(locale);
      if (!cached) {
        const miniSearch = new MiniSearch({
          // fixed option fields
          fields: ["content", "titles"],
          storeFields: ["id", "path", "titles", "content"],
          ...initConfig,
        });
        miniSearch.addAll(indexCache[locale]);
        localeCache.set(locale, { searcher: miniSearch });
      }
      const searcher = localeCache.get(locale).searcher;

      const results = searcher
        .search(query)
        .sort((a, b) => {
          if (sortKey === "id") return a.id - b.id;
          // compare score default
          return b.score - a.score;
        })
        .map((r) => pick(r, ["id", "path", "titles", "content"]) as SearchIndexItem);

      response.success = true;
      response.payload = { results };
      self.postMessage(response);
      break;
    }
  }
};
