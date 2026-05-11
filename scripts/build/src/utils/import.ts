import { projRoot } from "../const";
import { spawn } from "node:child_process";
import type { InputOptions, Plugin, RenderedChunk } from "rollup";
import { dirname, relative } from "node:path";
import { escapeRegex, buildLogger } from "@vitepress-theme-index/shared";
import { isArray } from "lodash-unified";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function getDependencies(pkgPath: string) {
  const pkg = require(pkgPath);
  const { dependencies, devDependencies, peerDependencies } = pkg;

  return {
    dependencies: dependencies ? Object.keys(dependencies) : [],
    devDependencies: devDependencies ? Object.keys(devDependencies) : [],
    peerDependencies: peerDependencies ? Object.keys(peerDependencies) : [],
  };
}

function run(command: string, args: string[], cwd: string = projRoot): Promise<void> {
  buildLogger.info(`🏃 run ${command} ${args.map((a) => JSON.stringify(a)).join(" ")}`);

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    const onExit = () => {
      if (!child.killed) child.kill();
    };
    process.once("exit", onExit);
    process.once("SIGINT", onExit);
    process.once("SIGTERM", onExit);

    child.on("error", (err) => {
      cleanup();
      reject(err);
    });

    child.on("close", (code) => {
      cleanup();
      if (code === 0) resolve();
      else {
        const error = new Error(`command failed: ${command} ${args.join(" ")} (code ${code})`);
        reject(error);
      }
    });

    function cleanup() {
      process.removeListener("exit", onExit);
      process.removeListener("SIGINT", onExit);
      process.removeListener("SIGTERM", onExit);
    }
  });
}

const rewriteSupportModules = ["esm", "cjs"] as const;
type RewriteSupportModules = (typeof rewriteSupportModules)[number];

interface RollupRewriteImportsEntry {
  resolution: RewriteSupportModules;
  ext: string;
}

interface RollupRewriteImportsOptions {
  targets?: Array<RewriteSupportModules | RollupRewriteImportsEntry>;
  rewrites?: Array<{
    source: string;
    target: string;
    entryFileName?: string;
  }>;
  // rewrite sideEffect import deps
  sideRewrites?: Array<{
    source: string;
    target: string;
  }>;
}

function rewriteImports(config: RollupRewriteImportsOptions): Plugin {
  const { rewrites = [], sideRewrites = [] } = config;
  const rewriteExternals = [...new Set([...rewrites, ...sideRewrites].map((item) => item.source))];

  const rewriteImports = (code: string, chunkDir: string, config: RollupRewriteImportsOptions) => {
    const replacePath = (target: string) => {
      let p = relative(chunkDir, target).replace(/\\/g, "/");
      return !p.startsWith(".") ? (p = `./${p}`) : p;
    };

    // default targets includes all mod
    const { targets = rewriteSupportModules, rewrites = [] } = config;
    const targetModules: Set<RewriteSupportModules> = new Set();
    const targetExtMap: Record<RewriteSupportModules, string> = { esm: ".mjs", cjs: ".cjs" };

    targets.forEach((tgt: RewriteSupportModules | RollupRewriteImportsEntry) => {
      if (typeof tgt === "string" && rewriteSupportModules.includes(tgt)) targetModules.add(tgt);
      if (typeof tgt === "object" && tgt.resolution) {
        targetModules.add(tgt.resolution);
        if (tgt.ext) targetExtMap[tgt.resolution] = tgt.ext;
      }
    });

    const createRewriter = (module: RewriteSupportModules) => (code: string) => {
      return rewrites.reduce((newCode, item) => {
        const entryName = item.entryFileName || "index";
        const entryPath = `${replacePath(item.target)}/${entryName}${targetExtMap[module]}`;

        if (module === "esm") {
          const importRegex = new RegExp(`from\\s+['"]${escapeRegex(item.source)}['"]`, "g");
          return newCode.replace(importRegex, `from '${entryPath}'`);
        } else if (module === "cjs") {
          const requireRegex = new RegExp(`require\\(['"]${escapeRegex(item.source)}['"]\\)`, "g");
          return newCode.replace(requireRegex, `require('${entryPath}')`);
        }
        return newCode;
      }, code);
    };

    let newCode = code;
    for (const mod of targetModules) {
      const rewriteFn = createRewriter(mod);
      newCode = rewriteFn(newCode);
    }
    return newCode;
  };

  const rewriteSideEffectImports = (code: string) => {
    const { sideRewrites = [] } = config;
    if (!sideRewrites.length) return code;

    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return sideRewrites.reduce((newCode, item) => {
      const src = escapeRegex(item.source);
      // match: "source" | "source/xxx" | "source/main.scss"
      const sideEffectImportRE = new RegExp(
        `(^|\\n)(\\s*)import\\s+(['"])(${src})(\\/[^'"]*)?\\3\\s*;?`,
        "g"
      );

      return newCode.replace(
        sideEffectImportRE,
        (_, lineStart, indent, quote, _matchedSource, subPath = "") =>
          `${lineStart}${indent}import ${quote}${item.target}${subPath}${quote};`
      );
    }, code);
  };

  return {
    name: "rollup-plugin-rewrite-imports",
    options(rawOptions: InputOptions) {
      const userExternal = rawOptions.external;

      rawOptions.external = (id: string, importer: string | undefined, isResolved: boolean) => {
        // inject
        if (rewriteExternals.some((pkg) => pkg === id || id.startsWith(`${pkg}/`))) {
          return true;
        }
        // reuse
        if (typeof userExternal === "function") return userExternal(id, importer, isResolved);
        if (isArray(userExternal)) return userExternal.includes(id);
        if (userExternal) return userExternal === id;
        return false;
      };
      return rawOptions;
    },
    renderChunk(code: string, chunk: RenderedChunk) {
      if (!code.trim()) return null;
      //   const _ext = extname(chunk.fileName).toLowerCase()

      const chunkDir = dirname(chunk.fileName);
      code = rewriteImports(code, chunkDir, config);
      code = rewriteSideEffectImports(code);
      return { code: code, map: null };
    },
  };
}

export { getDependencies, run, rewriteImports };
export type { RewriteSupportModules, RollupRewriteImportsEntry, RollupRewriteImportsOptions };
