import fs from "fs-extra";
import matter from "gray-matter";
import glob from "fast-glob";
import type { LimitFunction } from "p-limit";
import pLimit from "p-limit";
import { simpleGit } from "simple-git";
import { createHash } from "node:crypto";
import { dirname, relative, resolve } from "node:path";
import type { GitInfo, PostInfo } from "@vitepress-theme-index/shared";
import { ensureArray, pluginLogger } from "@vitepress-theme-index/shared";
import { readFile, stat } from "fs/promises";
import * as os from "node:os";
import type { DefaultLast, MetaCache, MetaConfig } from "../../types";

const cwd = process.cwd();
const git = simpleGit({ baseDir: process.cwd(), binary: "git" });
const utils = {
  md5: (str: string) => createHash("md5").update(str).digest("hex"),
  generateQuickHashKey: (stats: { path: string; mtime: number; size: number }[]) => {
    const fingerprint = stats
      .sort((a, b) => a.path.localeCompare(b.path))
      .map((s) => `${s.path}:${s.mtime}:${s.size}`)
      .join("|");
    return createHash("md5").update(fingerprint).digest("hex");
  },
  stat: async (file: string) => {
    const s = await stat(file);
    return {
      path: relative(cwd, file),
      mtime: s.mtimeMs,
      size: s.size,
      ctime: s.ctimeMs,
    };
  },
};

async function getGitInfo(
  file: string,
  defaultLast: DefaultLast,
  limit: LimitFunction,
  fileStat: any
): Promise<GitInfo> {
  return limit(async () => {
    try {
      const relPath = relative(process.cwd(), file);
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
): Promise<{ cache: MetaCache; changedHashes: Set<string> }> {
  const {
    cache,
    cache: { concurrency, defaultLast },
  } = config;
  const limit = pLimit(Math.min(concurrency, os.cpus().length * 2));
  const gitLimit = pLimit(4);

  const fileStats = await Promise.all(files.map((f) => utils.stat(f)));
  const hashKey = utils.generateQuickHashKey(fileStats);

  const prevPostMap = new Map<string, PostInfo>();
  if (prevCache) {
    prevCache.posts.forEach((post) => {
      prevPostMap.set(post.hash, post);
    });
  }

  const changedHashes = new Set<string>();
  const metas = await Promise.all(
    fileStats.map((fileStat) =>
      limit(async (): Promise<PostInfo> => {
        const content = await readFile(fileStat.path, "utf8");
        const { data: frontmatter } = matter(content);
        const hash = utils.md5(content + fileStat.path);

        // Check if this post has changed by comparing hash with previous cache
        const prevPost = prevPostMap.get(hash);
        if (!prevPost || prevPost.hash !== hash) {
          changedHashes.add(hash);
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

  return { cache: cached, changedHashes };
}

export async function loadMetaCache(config: MetaConfig): Promise<{
  posts: PostInfo[];
  changedHashes: Set<string>;
}> {
  const files = await glob(ensureArray(config.include), {
    absolute: true,
    cwd: process.cwd(),
    ignore: ensureArray(config.exclude),
  });
  const cacheFile = resolve(process.cwd(), ".vitepress", "cache", config.cache.dir, "vti-raw.json");

  let prevCache: MetaCache | undefined;

  if (config.cache.enable && (await fs.pathExists(cacheFile))) {
    try {
      const cached: MetaCache = await fs.readJSON(cacheFile);

      const fileStats = await Promise.all(files.map((f) => utils.stat(f)));
      const currentHash = utils.generateQuickHashKey(fileStats);

      if (cached.hashKey === currentHash) {
        pluginLogger.info("cache hit: fast hash matched");
        return { posts: cached.posts, changedHashes: new Set() };
      }

      prevCache = cached;
    } catch (error) {
      pluginLogger.warn(`failed to load meta cache: ${error}`);
    }
  }

  pluginLogger.warn("cache check failed, re-generating...");
  const { cache, changedHashes } = await generateMetaCache(files, config, cacheFile, prevCache);
  return { posts: cache.posts, changedHashes };
}
