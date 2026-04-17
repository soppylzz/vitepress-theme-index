import type {
  ArchiveAllStats,
  ArchiveData,
  ArchiveStat,
  BuildResult,
  DefineAble,
  LocaleArchiveStatsRecord,
  LocaleSearchIndexRecord,
  PostInfo,
  SearchIndex,
  SearchIndexItem,
} from "@vitepress-theme-index/shared";
import { ensureArray, pluginLogger, resolveDefineAble } from "@vitepress-theme-index/shared";
import type { IndexPostPlugin, MetaConfig } from "../../types";
import { dirname, join, resolve } from "node:path";
import fs from "fs-extra";
import { rimraf } from "rimraf";
import { createHash } from "node:crypto";
import { readFile } from "fs/promises";

interface TitleParagraph {
  titles: string[];
  content: string;
}

interface SearchIndexCacheItem {
  post: string;
  hash: string;
  items: SearchIndexItem[];
}

interface SearchIndexCache {
  [locale: string]: SearchIndexCacheItem[];
}

class IndexPostBuilder {
  private plugins: IndexPostPlugin[] = [];
  private registeredNames = new Set<string>();
  private searchIndexCache: SearchIndexCache = {};

  constructor(
    private config: MetaConfig,
    private cacheDir: string
  ) {}

  private getSearchIndexCachePath(locale: string): string {
    return resolve(this.cacheDir, locale, "search-index.json");
  }

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

  private extractLocale(filePath: string): string {
    const patterns = this.config.locale?.patterns || [];

    for (const { locale, pattern } of patterns) {
      const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
      if (regex.test(filePath)) {
        return locale;
      }
    }

    return this.config.locale?.default || "default";
  }

  private extractTitleParagraphs(content: string): TitleParagraph[] {
    const result: TitleParagraph[] = [];
    const lines = content.split("\n");
    let titleHierarchy: string[] = [];
    let currentParagraph: string[] = [];

    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headingMatch) {
        const level = headingMatch[1].length;
        const title = headingMatch[2].trim();

        if (currentParagraph.length > 0 && titleHierarchy.length > 0) {
          result.push({
            titles: [...titleHierarchy],
            content: currentParagraph.join("\n").trim(),
          });
          currentParagraph = [];
        }

        titleHierarchy = titleHierarchy.slice(0, level - 1);
        titleHierarchy.push(title);
      } else {
        const trimmed = line.trim();
        if (trimmed) {
          currentParagraph.push(line);
        }
      }
    }

    if (currentParagraph.length > 0 && titleHierarchy.length > 0) {
      result.push({
        titles: [...titleHierarchy],
        content: currentParagraph.join("\n").trim(),
      });
    }

    return result;
  }

  private async generateSearchIndexItems(
    post: PostInfo,
    postOrder: number
  ): Promise<SearchIndexItem[]> {
    try {
      const absolutePath = resolve(process.cwd(), post.path);
      const content = await readFile(absolutePath, "utf8");
      const titleParagraphs = this.extractTitleParagraphs(content);

      return titleParagraphs.map((tp, paragraphIndex) => {
        const idBase = `${post.hash}|${paragraphIndex}|${postOrder}`;
        const id = createHash("md5").update(idBase).digest("hex");

        return {
          id,
          post: post.hash,
          titles: tp.titles,
          content: tp.content,
        };
      });
    } catch (error) {
      pluginLogger.warn(`failed to generate search items for post ${post.path}: ${error}`);
      return [];
    }
  }

  private async loadSearchIndexCache(): Promise<SearchIndexCache> {
    const cache: SearchIndexCache = {};

    if (!this.config.cache.enable) {
      return cache;
    }

    const patterns = this.config.locale?.patterns || [];
    const locales = [this.config.locale?.default || "default", ...patterns.map((p) => p.locale)];
    const uniqueLocales = [...new Set(locales)];

    for (const locale of uniqueLocales) {
      const cacheFile = this.getSearchIndexCachePath(locale);
      try {
        if (await fs.pathExists(cacheFile)) {
          cache[locale] = (await fs.readJSON(cacheFile)) as SearchIndexCacheItem[];
        } else {
          cache[locale] = [];
        }
      } catch {
        pluginLogger.warn(`failed to load search index cache for locale: ${locale}`);
        cache[locale] = [];
      }
    }

    return cache;
  }

  private async saveSearchIndexCacheForLocale(locale: string): Promise<void> {
    if (!this.config.cache.enable) {
      return;
    }

    const cacheFile = this.getSearchIndexCachePath(locale);
    try {
      await fs.ensureDir(dirname(cacheFile));
      await fs.writeJSON(cacheFile, this.searchIndexCache[locale] || [], { spaces: 2 });
    } catch (e) {
      pluginLogger.warn(`failed to save search index cache for locale ${locale}: ${e}`);
    }
  }

  private async buildLocaleSearchIndex(
    posts: PostInfo[],
    locale: string,
    changedHashes: Set<string>
  ): Promise<SearchIndex> {
    const searchIndex: SearchIndex = [];

    if (!this.searchIndexCache[locale]) {
      this.searchIndexCache[locale] = [];
    }
    const localeCache = this.searchIndexCache[locale];

    const cacheMap = new Map<string, SearchIndexCacheItem>();
    for (const item of localeCache) {
      cacheMap.set(item.post, item);
    }

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const postHash = post.hash;

      const cachedItem = cacheMap.get(postHash);
      if (cachedItem && !changedHashes.has(postHash)) {
        searchIndex.push(...cachedItem.items);
      } else {
        const items = await this.generateSearchIndexItems(post, i);
        const newCacheItem: SearchIndexCacheItem = {
          post: postHash,
          items,
          hash: postHash,
        };

        if (cachedItem) {
          const idx = localeCache.indexOf(cachedItem);
          localeCache[idx] = newCacheItem;
          cacheMap.set(postHash, newCacheItem);
        } else {
          localeCache.push(newCacheItem);
          cacheMap.set(postHash, newCacheItem);
        }

        searchIndex.push(...items);
      }
    }

    return searchIndex;
  }

  public async build(
    posts: PostInfo[],
    baseUrl: string,
    changedHashes: Set<string>
  ): Promise<BuildResult> {
    pluginLogger.info(`🌘 start building index with ${posts.length} posts`);

    this.searchIndexCache = await this.loadSearchIndexCache();

    const postsByLocale = new Map<string, PostInfo[]>();
    for (const post of posts) {
      const locale = this.extractLocale(post.path);
      if (!postsByLocale.has(locale)) {
        postsByLocale.set(locale, []);
      }
      postsByLocale.get(locale)!.push(post);
    }

    const localeSearchIndexRecord: LocaleSearchIndexRecord = {};
    const localeArchiveStatsRecord: LocaleArchiveStatsRecord = {};
    const allPostInfo: PostInfo[] = [];

    for (const [locale, localePosts] of postsByLocale) {
      pluginLogger.info(`🌗 processing [locale:${locale}] with ${localePosts.length} posts`);

      localeSearchIndexRecord[locale] = await this.buildLocaleSearchIndex(
        localePosts,
        locale,
        changedHashes
      );

      // Build archive stats for each plugin
      const localeStatRecord: ArchiveAllStats = {};
      for (const plugin of this.plugins) {
        try {
          pluginLogger.info(`🌗 processing [plugin:${plugin.name}] for [locale:${locale}]`);
          const data = this.collectArchiveData(plugin, localePosts);
          localeStatRecord[plugin.name] = await this.buildPages(
            data,
            resolve(this.cacheDir, locale, plugin.name),
            join(baseUrl, locale, plugin.name)
          );
        } catch (e) {
          pluginLogger.error(e);
        }
      }
      localeArchiveStatsRecord[locale] = localeStatRecord;

      localePosts.forEach((post) => {
        allPostInfo.push(post);
      });
    }

    for (const locale of postsByLocale.keys()) {
      await this.saveSearchIndexCacheForLocale(locale);
    }
    pluginLogger.info("🌕 build completed!");

    return {
      searchIndex: localeSearchIndexRecord,
      statRecord: localeArchiveStatsRecord,
      allPostInfo,
    };
  }

  private collectArchiveData(plugin: IndexPostPlugin, posts: PostInfo[]): ArchiveData {
    const data: ArchiveData = {};

    for (const post of posts) {
      try {
        const rawKeys = plugin.extract(post);
        if (!rawKeys) continue;

        const keys = ensureArray(rawKeys);
        for (const key of keys) {
          const trimmedKey = key.trim();
          if (!trimmedKey) continue;

          if (!data[trimmedKey]) {
            data[trimmedKey] = [];
          }
          data[trimmedKey].push(post);
        }
      } catch (error) {
        pluginLogger.warn(`error extracting data from post ${post.path}: ${error}`);
      }
    }

    // Apply postProcess if defined
    return plugin.postProcess ? plugin.postProcess(data) : data;
  }

  private async buildPages(
    data: ArchiveData,
    saveDir: string,
    pluginUrl: string
  ): Promise<ArchiveStat> {
    const record: ArchiveStat["record"] = {};
    const pageSize = this.config.index.pageSize;
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
