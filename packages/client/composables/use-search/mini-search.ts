import MiniSearch from "minisearch";

let miniSearch: MiniSearch | null = null;
let currentLocale: string | null = null;

self.onmessage = async (e) => {
  const { type, payload, id, locale } = e.data;

  switch (type) {
    case "init": {
      currentLocale = locale || "root";
      const { default: indexRecord } = await import("virtual:index-search");

      miniSearch = new MiniSearch({
        fields: ["content", "titles"],
        storeFields: ["id", "path", "titles", "content"],
        searchOptions: {
          prefix: true,
          fuzzy: 0.2,
        },
      });

      const localeIndex = indexRecord[currentLocale];
      if (localeIndex && Array.isArray(localeIndex)) {
        miniSearch.addAll(localeIndex);
        self.postMessage({ type: "inited", success: true });
      } else {
        self.postMessage({
          type: "inited",
          success: false,
          error: `search index not found for locale: ${currentLocale}`,
        });
      }
      break;
    }

    case "search": {
      try {
        if (!miniSearch) {
          self.postMessage({
            type: "result",
            payload: [],
            id,
            error: "mini-search not initialized",
          });
          return;
        }

        const results = miniSearch.search(payload);
        self.postMessage({ type: "result", payload: results, id });
      } catch (err) {
        self.postMessage({
          type: "result",
          payload: [],
          id,
          error: err instanceof Error ? err.message : "unknown search error",
        });
      }
      break;
    }
  }
};
