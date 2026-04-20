import type { Alias, ViteDevServer } from "vite";
import { normalizePath } from "vite";
import { isArray } from "lodash-unified";
import { relative } from "node:path";
import { createHash } from "node:crypto";
import { stat } from "fs/promises";

function normalizeAlias(alias?: Readonly<Alias[] | Record<string, string>>): Alias[] {
  if (!alias) return [];
  if (isArray(alias)) return [...alias] as Alias[];
  return Object.entries(alias).map(([find, replacement]) => ({ find, replacement }));
}

function applyAlias(id: string, alias: Alias[]) {
  const normalizedId = normalizePath(id);
  for (const a of alias) {
    const { find, replacement } = a;
    if (find instanceof RegExp) {
      if (!find.test(normalizedId)) continue;
      return normalizedId.replace(find, replacement);
    }
    if (normalizedId === find || normalizedId.startsWith(`${find}/`)) {
      return `${replacement}${normalizedId.slice(find.length)}`;
    }
  }
  return normalizedId;
}

async function ssrRewriteLoadModules(
  viteServer: ViteDevServer,
  filePath: string,
  rewrites?: {
    alias?: Alias[] | readonly Alias[];
  }
) {
  const container = viteServer.pluginContainer;
  const originalResolveId = container.resolveId.bind(container);

  container.resolveId = async (id, importer, options) => {
    const isEntry = !importer || importer === filePath;
    if (isEntry) {
      const preResolvedId = applyAlias(id, [...(rewrites?.alias || [])]);
      return originalResolveId(preResolvedId, importer, options);
    }
    return originalResolveId(id, importer, options);
  };

  try {
    const module = viteServer.moduleGraph.getModuleById(filePath);
    if (module) viteServer.moduleGraph.invalidateModule(module);
    return await viteServer.ssrLoadModule(filePath);
  } finally {
    container.resolveId = originalResolveId;
  }
}

/* ==================== post utilities ==================== */
function createMD5Hash(str: string): string {
  return createHash("md5").update(str).digest("hex");
}

function generateCacheKeyFromStats(
  fileStats: Array<{
    path: string;
    mtime: number;
    size: number;
  }>
): string {
  const fingerprint = fileStats
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((s) => `${s.path}:${s.mtime}:${s.size}`)
    .join("|");
  return createMD5Hash(fingerprint);
}

async function getFileStat(file: string): Promise<{
  path: string;
  mtime: number;
  size: number;
  ctime: number;
}> {
  const s = await stat(file);
  return {
    path: relative(process.cwd(), file),
    mtime: s.mtimeMs,
    size: s.size,
    ctime: s.ctimeMs,
  };
}

function generateSearchItemId(postHash: string, paragraphIndex: number, postOrder: number): string {
  const idBase = `${postHash}|${paragraphIndex}|${postOrder}`;
  return createMD5Hash(idBase);
}

export {
  ssrRewriteLoadModules,
  normalizeAlias,
  createMD5Hash,
  generateCacheKeyFromStats,
  getFileStat,
  generateSearchItemId,
};
