import { dirname, join, relative, resolve } from "node:path";
import { projDist, themeRoot } from "../const";
import { mkdir, writeFile } from "fs/promises";
import { copy } from "fs-extra";
import * as sass from "sass";
import glob from "fast-glob";

const srcDir = resolve(themeRoot, "src");
const destDir = resolve(projDist, "theme");

async function buildStyles() {
  // compile css
  const files = await glob("**/*.scss", {
    cwd: srcDir,
    absolute: true,
    ignore: ["node_modules", "**/_*.scss"],
  });

  for (const file of files) {
    const relativePath = relative(srcDir, file);
    const outFile = join(destDir, relativePath).replace(/\.scss|.sass$/, ".css");

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
}

export { buildStyles };
