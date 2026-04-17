import MiniSearch from "minisearch";

let miniSearch: MiniSearch | null = null;

self.onmessage = async (e) => {
  const { type, payload, id } = e.data;

  switch (type) {
    case "init": {
      const { default: index } = await import("virtual:index-search");

      miniSearch = new MiniSearch({
        fields: ["content"],
        storeFields: ["id", "path", "content"],
        searchOptions: {
          prefix: true,
          fuzzy: 0.2,
        },
      });

      miniSearch.addAll(index);

      self.postMessage({ type: "inited" });
      break;
    }

    case "search": {
      if (!miniSearch) {
        self.postMessage({ type: "result", payload: [], id });
        return;
      }

      const results = miniSearch.search(payload);

      self.postMessage({
        type: "result",
        payload: results,
        id,
      });
      break;
    }
  }
};
