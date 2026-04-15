import { useInject } from "../use-inject";
import { indexOverallKey } from "../../types";
import { useData, useRoute } from "vitepress";
import { normalizeLink, useSplitRefs } from "../../utils";

function usePost() {
  const { site } = useData();
  const route = useRoute();
  const all = useInject(indexOverallKey);

  return useSplitRefs(() => {
    return all.find((item) => normalizeLink(site.value, item.path) === route.path);
  });
}

export { usePost };
