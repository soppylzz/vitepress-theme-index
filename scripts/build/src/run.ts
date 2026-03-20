import { buildClient, buildNode, buildShared, buildStyles } from "./build";
import { indexRoot, projDist, projRoot, typeDist } from "./const";
import { run } from "./utils";
import { copy } from "fs-extra";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "node:path";
import glob from "fast-glob";
import { buildLogger } from "@vitepress-theme-index/shared";

const buildTypes = async () => {
  // build dts by tsc
  await run("pnpm", ["run", "build:types"]);
  // rewrite dts
  const rewriteFile = async (filePath: string) => {
    let content = await readFile(filePath, "utf-8");
    // transform @-import to package self-import
    content = content.replace("@vitepress-theme-index", "vitepress-theme-index");
    await writeFile(filePath, content, "utf-8");
  };
  const filePaths = await glob("**/*.d.ts", { cwd: typeDist, absolute: true });
  await Promise.all(
    filePaths.map(async (path) => {
      await rewriteFile(path);
    })
  );
  // copy to dist
  await copy(typeDist, projDist);
  await copy(resolve(indexRoot, "index.d.ts"), resolve(projDist, "index.d.ts"));
  await copy(resolve(projRoot, "README.md"), resolve(indexRoot, "README.md"));
  await copy(resolve(projRoot, "LICENSE"), resolve(indexRoot, "LICENSE"));
};

async function build() {
  await run("pnpm", ["run", "clean:dist"]);
  // build js
  await buildShared();
  await buildClient();
  await buildNode();
  // build dts
  await buildTypes();
  // build style
  await buildStyles();
  // copy to publish
  await copy(projDist, resolve(indexRoot, "dist"));
}

build().catch((err) => {
  buildLogger.error(err);
  process.exit(1);
});
