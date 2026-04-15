import type {
  ArchiveAllStats,
  ArchiveData,
  ArchiveStat,
  DefineAble,
  PostInfo,
  PostRawData,
  SearchIndex,
} from "@vitepress-theme-index/shared";
import { ensureArray, pluginLogger, resolveDefineAble } from "@vitepress-theme-index/shared";
import type { IndexPostPlugin, MetaConfig } from "../../types";
import { join, resolve } from "node:path";
import fs from "fs-extra";
import { rimraf } from "rimraf";

class IndexPostBuilder {
  private plugins: IndexPostPlugin[] = [];
  private registeredNames = new Set<string>();

  constructor(private config: MetaConfig) {}

  public async use(plugin: DefineAble<IndexPostPlugin>[]) {
    const plugins = await Promise.all(
      ensureArray(plugin).map(async (raw) => {
        const p = await resolveDefineAble(raw);
        p.name = p.name.trim();
        return p;
      })
    );
    for (const plugin of plugins) {
      const name = plugin.name;
      if (!name) pluginLogger.error("plugin name is empty");
      if (this.registeredNames.has(name)) pluginLogger.error("plugin name has been registered");

      this.registeredNames.add(name);
      this.plugins.push(plugin);
    }
    return this;
  }

  public async build(posts: PostRawData[], workDir: string, baseUrl: string) {
    pluginLogger.info(`🌘 start building index with ${posts.length} posts`);

    const searchIndex: SearchIndex = [];
    const allPostInfo: PostInfo[] = [];

    posts.forEach((post) => {
      const { content, ...postInfo } = post;
      searchIndex.push({ id: postInfo.hash, content: content });
      allPostInfo.push(postInfo);
    });

    const statRecord = {} as ArchiveAllStats;

    for (const plugin of this.plugins) {
      try {
        pluginLogger.info(`processing plugin: ${plugin.name}`);
        const data = this.collectArchiveData(plugin, posts);
        statRecord[plugin.name] = await this.buildPages(
          data,
          resolve(workDir, plugin.name),
          join(baseUrl, plugin.name)
        );
      } catch (e) {
        pluginLogger.error(e);
      }
    }

    pluginLogger.info("🌕 build completed!");
    return { searchIndex, statRecord, allPostInfo };
  }

  private collectArchiveData(plugin: IndexPostPlugin, posts: PostRawData[]) {
    const data: ArchiveData = {};

    for (const post of posts) {
      const { content, ...info } = post;
      const rawKeys = plugin.extract(post);
      if (!rawKeys) continue;

      for (const key of ensureArray(rawKeys)) {
        const safeKey = key.trim();
        if (!safeKey) continue;
        (data[safeKey] ??= []).push(info);
      }
    }

    return plugin?.postProcess ? plugin?.postProcess(data) : data;
  }

  private async buildPages(
    data: ArchiveData,
    saveDir: string,
    pluginUrl: string
  ): Promise<ArchiveStat> {
    const record: ArchiveStat["record"] = {};
    const pageSize = this.config.cache.pageSize || 10;
    const writeTasks: Promise<void>[] = [];

    await rimraf(saveDir);

    for (const [type, postList] of Object.entries(data)) {
      if (!postList.length || !type.trim()) continue;

      const total = Math.ceil(postList.length / pageSize);
      const typeUrl = join(pluginUrl, type.trim());
      const typeDir = resolve(saveDir, type);

      writeTasks.push(
        (async () => {
          await fs.ensureDir(typeDir);
          for (let i = 0; i < total; i++) {
            const pageData = postList.slice(i * pageSize, (i + 1) * pageSize);
            const filePath = resolve(typeDir, `${i + 1}.json`);

            await fs.writeJSON(filePath, pageData, { spaces: 2 });
          }
        })()
      );

      record[type] = { total, url: typeUrl };
    }

    await Promise.all(writeTasks);
    return { pageSize, record };
  }
}

export { IndexPostBuilder };
