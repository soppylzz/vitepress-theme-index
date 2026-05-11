import { resolve } from "node:path";
import { builtinModules } from "node:module";
import {
  clientRoot,
  pkgRoot,
  nodeRoot,
  projDist,
  projRoot,
  sharedRoot,
  cliRoot,
  cliDist,
} from "../const";
import type { BuildOptions } from "./misc";
import { buildPackage, excludeFiles, generateExternals } from "./misc";
import glob from "fast-glob";
import { rewriteImports } from "../utils";
import fs from "fs-extra";

import type { ModuleFormat, Plugin } from "rollup";
import { default as nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import esbuild from "rollup-plugin-esbuild";
import postcss from "rollup-plugin-postcss";

import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

import { ensureArray } from "@vitepress-theme-index/shared";
import type { MaybeArray } from "@vitepress-theme-index/shared";

const cliEntry = "cli.mjs";
const sourcemap: boolean = false;
const treeshake: boolean = false;
const tsconfigPath = resolve(projRoot, "tsconfig.lib.json");

async function multiGlob(
  roots: string[],
  pattern: MaybeArray<string> = "**/*.{vue,js,ts}"
): Promise<string[]> {
  const patterns = [...ensureArray(pattern), "!**/*.d.ts"];
  const files = await Promise.all(
    roots.map((root) => glob(patterns, { cwd: root, absolute: true, onlyFiles: true }))
  );
  return files.flat();
}

function generateOutputs(
  preserveModulesRoot: string,
  formats: ModuleFormat[] = ["esm", "cjs"]
): BuildOptions["output"] {
  const defaultOutputs: BuildOptions["output"] = [
    {
      format: "esm",
      dir: projDist,
      preserveModules: true,
      preserveModulesRoot,
      entryFileNames: ({ name }) => `${name}.mjs`,
      assetFileNames: "[topic][extname]",
      sourcemap,
    },
    {
      format: "cjs",
      exports: "named",
      dir: projDist,
      preserveModules: true,
      preserveModulesRoot,
      entryFileNames: ({ name }) => `${name}.cjs`,
      sourcemap,
    },
  ];
  return defaultOutputs.filter((option) => option.format && formats.includes(option.format));
}

async function buildCli(isDev: boolean = false) {
  const input = resolve(cliRoot, "index.ts");

  await buildPackage({
    name: "@vitepress-theme-index/cli",
    input: {
      input,
      external: generateExternals([...builtinModules, "node:"]),
      treeshake,
    },
    output: [
      {
        format: "esm",
        dir: cliRoot,
        preserveModules: false,
        entryFileNames: cliEntry,
        sourcemap,
        banner: "#!/usr/bin/env node",
      },
    ],
    plugins: [
      nodeResolve({ extensions: [".mjs", ".js", ".ts"] }),
      commonjs(),
      esbuild({
        tsconfig: tsconfigPath,
        platform: "node",
      }),
      rewriteImports({
        rewrites: isDev
          ? []
          : [
              {
                source: "@vitepress-theme-index/shared",
                target: "../shared", // has different chunkDir
                entryFileName: "node",
              },
            ],
      }),
    ],
  });

  if (!isDev) {
    const cliFiles = await glob("template/**/*", {
      cwd: cliRoot,
      absolute: false,
      onlyFiles: true,
    });

    fs.copySync(resolve(cliRoot, cliEntry), resolve(cliDist, cliEntry));
    cliFiles.forEach((file) => {
      const srcPath = resolve(cliRoot, file);
      const destPath = resolve(cliDist, file);
      fs.copySync(srcPath, destPath, { overwrite: true });
    });
  }
}

async function buildShared() {
  const inputs = excludeFiles([...(await multiGlob([sharedRoot]))]);

  await buildPackage({
    name: "@vitepress-theme-index/shared",
    input: {
      input: inputs,
      external: generateExternals(),
      treeshake,
    },
    output: generateOutputs(pkgRoot),
    plugins: [
      nodeResolve({ extensions: [".mjs", ".js", ".ts"] }),
      esbuild({
        tsconfig: tsconfigPath,
        platform: "neutral",
      }),
    ],
  });
}

async function buildNode() {
  const inputs = excludeFiles([...(await multiGlob([nodeRoot]))]);
  await buildPackage({
    name: "@vitepress-theme-index/node",
    input: {
      input: inputs,
      external: generateExternals([...builtinModules, "node:"]),
      treeshake,
    },
    output: generateOutputs(pkgRoot),
    plugins: [
      commonjs(),
      nodeResolve({ extensions: [".mjs", ".js", ".ts"] }),
      esbuild({
        tsconfig: tsconfigPath,
        platform: "node",
      }),
      rewriteImports({
        rewrites: [
          {
            source: "@vitepress-theme-index/shared",
            target: "shared",
            entryFileName: "node",
          },
        ],
      }),
    ],
  });
}

async function buildClient() {
  const inputs = excludeFiles([...(await multiGlob([clientRoot]))]);

  await buildPackage({
    name: "@vitepress-theme-index/client",
    input: {
      input: inputs,
      // Be careful not to import any other packages related to “virtual”.
      external: generateExternals(["virtual", "vitepress-theme-index"]),
      treeshake,
    },
    output: generateOutputs(pkgRoot, ["esm"]),

    plugins: [
      nodeResolve({ extensions: [".mjs", ".js", ".ts", ".vue", ".tsx"] }),
      esbuild({
        tsconfig: tsconfigPath,
        platform: "browser",
        jsx: "preserve",
      }),
      rewriteImports({
        rewrites: [
          {
            source: "@vitepress-theme-index/shared",
            target: "shared",
            entryFileName: "client",
          },
        ],
        targets: ["esm"],
        sideRewrites: [
          {
            source: "@vitepress-theme-index/theme",
            target: "vitepress-theme-index/theme",
          },
        ],
      }),
      vue({}) as unknown as Plugin,
      vueJsx() as unknown as Plugin,
      postcss({
        extract: false,
        minimize: true,
        sourceMap: true,
      }),
    ],
  });
}

export { buildCli, buildShared, buildClient, buildNode };
