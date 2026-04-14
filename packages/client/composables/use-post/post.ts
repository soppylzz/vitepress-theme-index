import { useInject } from "../use-inject";
import { indexArchiveKey } from "../../types";
import { useData, useRoute } from "vitepress";
import { normalizeLink, useSplitRefs } from "../../utils";
import { pluginLogger } from "@vitepress-theme-index/shared";

function usePost() {
  const { site } = useData();
  const route = useRoute();
  const overall = useInject(indexArchiveKey)["timeline"]["overall"];
  if (!overall) {
    pluginLogger.error("unable find default archive data");
  }

  return useSplitRefs(() => {
    return overall.find((item) => normalizeLink(site.value, item.path) === route.path);
  });
}

export { usePost };
