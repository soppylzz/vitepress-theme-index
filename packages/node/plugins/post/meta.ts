import fs from "fs-extra";
import matter from "gray-matter";
import glob from "fast-glob";
import type { LimitFunction } from "p-limit";
import pLimit from "p-limit";
import { simpleGit } from "simple-git";
import { dirname, relative, resolve } from "node:path";
import type { GitInfo, PostInfo } from "@vitepress-theme-index/shared";
import { ensureArray, pluginLogger } from "@vitepress-theme-index/shared";
import { readFile } from "fs/promises";
import * as os from "node:os";
import type { DefaultLast, MetaCache, MetaConfig } from "../../types";
import { generateCacheKey, getFileStat } from "../../utils";

const cwd = process.cwd();
const git = simpleGit({ baseDir: cwd, binary: "git" });

async function getGitInfo(
  file: string,
  defaultLast: DefaultLast,
  limit: LimitFunction,
  fileStat: any
): Promise<GitInfo> {
  return limit(async () => {
    try {
      const relPath = relative(cwd, file);
      const log = await git.log({ file: relPath });

      if (log.all.length) {
        return {
          firstCommit: new Date(log.all[log.all.length - 1].date).getTime(),
          lastCommit: new Date(log.all[0].date).getTime(),
          isFallback: false,
        };
      }
    } catch {
      /* ignore */
    }

    return {
      firstCommit: fileStat.ctime,
      lastCommit: defaultLast === "now" ? Date.now() : fileStat.mtime,
      isFallback: true,
    };
  });
}

async function generateMetaCache(
  files: string[],
  config: MetaConfig,
  cacheFile: string,
  prevCache?: MetaCache
): Promise<{ cache: MetaCache; changedPostPath: Set<string>; allPostPath: Set<string> }> {
  const {
    cache,
    cache: { concurrency, defaultLast },
  } = config;
  const limit = pLimit(Math.min(concurrency, os.cpus().length * 2));
  const gitLimit = pLimit(4);

  const fileStats = await Promise.all(files.map((f) => getFileStat(f)));
  const hashKey = generateCacheKey(fileStats);

  const prevPostMap = new Map<string, PostInfo>();
  if (prevCache) {
    prevCache.posts.forEach((post) => {
      prevPostMap.set(post.path, post);
    });
  }

  const allPostPath = new Set<string>();
  const changedPostPath = new Set<string>();
  const metas = await Promise.all(
    fileStats.map((fileStat) =>
      limit(async (): Promise<PostInfo> => {
        const content = await readFile(fileStat.path, "utf8");
        const { data: frontmatter } = matter(content);
        const hash = generateCacheKey(fileStats);

        // Record all existing post paths
        allPostPath.add(fileStat.path);

        // Check if this post has changed by comparing hash with previous cache
        const prevPost = prevPostMap.get(fileStat.path);
        if (!prevPost || prevPost.hash !== hash) {
          changedPostPath.add(fileStat.path);
        }

        const gitInfo = await getGitInfo(fileStat.path, defaultLast, gitLimit, fileStat);

        return {
          path: fileStat.path,
          frontmatter,
          hash,
          ...gitInfo,
        };
      })
    )
  );

  metas.sort((a, b) => a.firstCommit - b.firstCommit);

  const cached: MetaCache = {
    hashKey,
    generate: Date.now(),
    posts: metas,
  };

  if (cache.enable) {
    await fs.ensureDir(dirname(cacheFile));
    await fs.writeJSON(cacheFile, cached, { spaces: 2 });
  }

  return { cache: cached, changedPostPath, allPostPath };
}

async function loadMetaCache(config: MetaConfig): Promise<{
  posts: PostInfo[];
  changedPostPath: Set<string>;
  allPostPath: Set<string>;
}> {
  const files = await glob(ensureArray(config.include), {
    absolute: true,
    cwd: cwd,
    ignore: ensureArray(config.exclude),
  });
  const cacheFile = resolve(cwd, ".vitepress", "cache", config.cache.dir, "vti-infos.json");

  let prevCache: MetaCache | undefined;

  if (config.cache.enable && (await fs.pathExists(cacheFile))) {
    try {
      const cached: MetaCache = await fs.readJSON(cacheFile);

      const fileStats = await Promise.all(files.map((f) => getFileStat(f)));
      const currentHash = generateCacheKey(fileStats);

      if (cached.hashKey === currentHash) {
        pluginLogger.info("cache hit: fast hash matched");
        const allPostPath = new Set(files);
        return { posts: cached.posts, changedPostPath: new Set(), allPostPath };
      }

      prevCache = cached;
    } catch (error) {
      pluginLogger.warn(`failed to load meta cache: ${error}`);
    }
  }

  pluginLogger.warn("cache check failed, re-generating...");
  const { cache, changedPostPath, allPostPath } = await generateMetaCache(
    files,
    config,
    cacheFile,
    prevCache
  );
  return { posts: cache.posts, changedPostPath, allPostPath };
}

export { loadMetaCache };
