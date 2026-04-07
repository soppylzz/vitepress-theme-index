import fs from "fs-extra";
import matter from "gray-matter";
import glob from "fast-glob";
import type { LimitFunction } from "p-limit";
import pLimit from "p-limit";
import { simpleGit } from "simple-git";
import { createHash } from "node:crypto";
import { dirname, relative } from "node:path";
import type { GitInfo, PostMetaInfo } from "@vitepress-theme-index/shared";
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

async function generateMetaCache(files: string[], config: MetaConfig): Promise<MetaCache> {
  const { cache } = config;
  const limit = pLimit(Math.min(cache.concurrency, os.cpus().length * 2));
  const gitLimit = pLimit(4);

  const fileStats = await Promise.all(files.map((f) => utils.stat(f)));
  const hashKey = utils.generateQuickHashKey(fileStats);

  const metas = await Promise.all(
    fileStats.map((fileStat) =>
      limit(async (): Promise<PostMetaInfo> => {
        const content = await readFile(fileStat.path, "utf8");
        const { data: frontmatter } = matter(content);
        const gitInfo = await getGitInfo(fileStat.path, cache.defaultLast, gitLimit, fileStat);

        return {
          path: fileStat.path,
          content,
          frontmatter,
          hash: utils.md5(content),
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
    await fs.ensureDir(dirname(cache.file));
    await fs.writeJSON(cache.file, cached, { spaces: 2 });
  }

  return cached;
}

export async function loadMetaCache(config: MetaConfig): Promise<MetaCache> {
  const files = await glob(ensureArray(config.include), {
    absolute: true,
    cwd: process.cwd(),
    ignore: ensureArray(config.exclude),
  });

  if (config.cache.enable && (await fs.pathExists(config.cache.file))) {
    try {
      const cached: MetaCache = await fs.readJSON(config.cache.file);

      const fileStats = await Promise.all(files.map((f) => utils.stat(f)));
      const currentHash = utils.generateQuickHashKey(fileStats);

      if (cached.hashKey === currentHash) {
        pluginLogger.info("cache hit: fast hash matched");
        return cached;
      }
    } catch {
      /* ignore */
    }
  }
  pluginLogger.warn("cache check failed, re-generating...");
  return await generateMetaCache(files, config);
}
