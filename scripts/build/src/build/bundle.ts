import { resolve } from "node:path";
import { builtinModules } from "node:module";
import { clientRoot, pkgRoot, nodeRoot, projDist, projRoot, sharedRoot } from "../const";
import type { BuildOptions } from "./misc";
import { buildPackage, excludeFiles, generateExternals } from "./misc";
import {
  VIRTUAL_INDEX_CONFIG_PKG,
  VIRTUAL_INDEX_I18N_PKG,
  VIRTUAL_INDEX_ADDITION_PKG,
} from "@vitepress-theme-index/shared";
import glob from "fast-glob";
import type { RollupRewriteImportsOptions } from "../utils";
import { rewriteImports } from "../utils";

import type { ModuleFormat, Plugin } from "rollup";
import { default as nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
import postcss from "rollup-plugin-postcss";

import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

const sourcemap: boolean = false;
const treeshake: boolean = false;
const tsconfigPath = resolve(projRoot, "tsconfig.lib.json");
const sharedRewriteConfig: RollupRewriteImportsOptions = {
  rewrites: [
    {
      source: "@vitepress-theme-index/shared",
      target: "shared",
      entryFileName: "index",
    },
  ],
};

async function multiGlob(roots: string[], pattern: string = "**/*.{vue,js,ts}"): Promise<string[]> {
  const files = await Promise.all(
    roots.map((root) => glob(pattern, { cwd: root, absolute: true, onlyFiles: true }))
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
      nodeResolve({ extensions: [".mjs", ".js", ".ts"] }),
      esbuild({
        tsconfig: tsconfigPath,
        platform: "node",
      }),
      rewriteImports(sharedRewriteConfig),
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
      external: generateExternals(["virtual"]),
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
        ...sharedRewriteConfig,
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

export { buildShared, buildClient, buildNode, buildPackage };
