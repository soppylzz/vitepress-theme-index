import { run } from "../utils";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import glob from "fast-glob";
import { iconDist, iconRoot, indexRoot, projDist, projRoot, themeRoot, typeDist } from "../const";
import { copy } from "fs-extra";
import { dirname, relative, resolve } from "node:path";
import * as sass from "sass";

async function buildTypes() {
  // build dts by vue-tsc, distinguish between runtime tsconfig.json and build tsconfig.json
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
  await copy(typeDist, projDist);
  await copy(resolve(indexRoot, "index.d.ts"), resolve(projDist, "index.d.ts"));
}

async function buildStyles() {
  const srcDir = resolve(themeRoot, "src");
  const destDir = resolve(projDist, "theme");

  // compile css
  const files = await glob("**/*.scss", {
    cwd: srcDir,
    absolute: true,
    onlyFiles: true,
    ignore: ["node_modules/**/*", "**/_*.scss"],
  });

  for (const file of files) {
    const relativePath = relative(srcDir, file);
    const outFile = resolve(destDir, relativePath).replace(/\.scss|.sass$/, ".css");

    const result = sass.compile(file, {
      // style: "compressed",
      sourceMap: false,
    });

    if (result.css.trim().length === 0) continue;
    await mkdir(dirname(outFile), { recursive: true });
    await writeFile(outFile, result.css, { encoding: "utf8" });
  }
  // copy scss
  await copy(resolve(themeRoot, "src"), resolve(projDist, "theme", "src"));
  await copy(resolve(themeRoot, "src", "assets"), resolve(projDist, "theme", "assets"));
}

async function buildResources() {
  await buildTypes();
  await buildStyles();

  await copy(iconRoot, iconDist);
  await copy(resolve(projRoot, "README.md"), resolve(indexRoot, "README.md"));
  await copy(resolve(projRoot, "LICENSE"), resolve(indexRoot, "LICENSE"));
}

export { buildResources };
