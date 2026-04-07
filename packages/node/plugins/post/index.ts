import type { IndexPluginContext, MetaConfig } from "../../types";
import type { Plugin } from "vite";
import { PLUGIN_PREFIX } from "../../const";
import { VIRTUAL_INDEX_ARCHIVE_PKG, VIRTUAL_INDEX_SEARCH_PKG } from "@vitepress-theme-index/shared";
import { IndexPostBuilder } from "./archive";
import { loadMetaCache } from "./meta";

const searchVirtualId = VIRTUAL_INDEX_SEARCH_PKG;
const archiveVirtualId = VIRTUAL_INDEX_ARCHIVE_PKG;

const searchResolvedId = `\0${searchVirtualId}`;
const archiveResolvedId = `\0${archiveVirtualId}`;

function createMetaPlugin(ctx: IndexPluginContext): Plugin {
  let config: MetaConfig;
  let datas: ReturnType<IndexPostBuilder["build"]> | null = null;

  return {
    name: `${PLUGIN_PREFIX}/post`,
    buildStart: {
      sequential: true,
      async handler() {
        config = ctx.ctx.meta;
        const cache = await loadMetaCache(config);
        const builder = await new IndexPostBuilder().use(ctx.ctx.plugins);
        datas = builder.build(cache.posts);
      },
    },
    resolveId(id) {
      if (id === searchVirtualId) return searchVirtualId;
      if (id === archiveVirtualId) return archiveResolvedId;
      return undefined;
    },
    load(id) {
      if (id === searchResolvedId)
        return `export default ${JSON.stringify(datas.searchIndex ?? {})};`;
      if (id === archiveResolvedId)
        return `export default ${JSON.stringify(datas.archives ?? {})};`;
      return;
    },
  };
}

export { createMetaPlugin, searchResolvedId, archiveResolvedId };
