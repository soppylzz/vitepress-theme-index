import { buildCli, buildClient, buildNode, buildShared, buildResources } from "./build";
import { buildLogger } from "@vitepress-theme-index/shared";
import { cliRoot, indexDist, projDist, projRoot } from "./const";
import { copy } from "fs-extra";
import { resolve } from "node:path";
import mri from "mri";
import glob from "fast-glob";
import { rimraf } from "rimraf";

interface IndexBuildOptions {
  mode: "full" | "cli";
}

async function cleanCli() {
  const delFiles = await glob("**/*", {
    cwd: cliRoot,
    dot: true,
    absolute: true,
    onlyFiles: false, // should clean dir
    ignore: [
      "node_modules/**/*",
      "template/**/*",
      "src/**/*",
      "node_modules",
      "template",
      "src",
      "package.json",
      "index.ts",
    ],
  });
  await rimraf(delFiles);
}

async function cleanFull() {
  await cleanCli();
  await rimraf([
    indexDist,
    resolve(projRoot, "dist"),
    resolve(indexDist, "LICENSE"),
    resolve(indexDist, "README.md"),
  ]);
}

async function build(options: Partial<IndexBuildOptions>) {
  const { mode = "full" } = options;

  switch (mode) {
    case "cli": {
      await cleanCli();
      await buildCli(true);
      break;
    }
    case "full":
    default: {
      await cleanFull();
      // build js-bundle
      await buildCli(false);

      await buildShared();
      await buildClient();
      await buildNode();

      // build assistance resources
      await buildResources();
      // copy to publish
      await copy(projDist, indexDist);
    }
  }
}

const args = mri<IndexBuildOptions>(process.argv.slice(2));
build(args).catch((err) => {
  buildLogger.error(err);
  process.exit(1);
});
