import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/* =============== build path =============== */
const __dirname = dirname(fileURLToPath(import.meta.url));

const projRoot = resolve(__dirname, "..", "..", "..");
const pkgRoot = resolve(projRoot, "packages");

const clientRoot = resolve(pkgRoot, "client");
const nodeRoot = resolve(pkgRoot, "node");
const sharedRoot = resolve(pkgRoot, "shared");
const themeRoot = resolve(pkgRoot, "theme");
const cliRoot = resolve(pkgRoot, "cli");
const indexRoot = resolve(pkgRoot, "index");
const iconRoot = resolve(pkgRoot, "icons");

const projDist = resolve(projRoot, "dist", "dist");
const typeDist = resolve(projRoot, "dist", "types", "packages");
const cliDist = resolve(projDist, "cli");
const iconDist = resolve(projDist, "icons");
const indexDist = resolve(indexRoot, "dist");

export {
  projRoot,
  pkgRoot,
  clientRoot,
  nodeRoot,
  sharedRoot,
  themeRoot,
  indexRoot,
  iconRoot,
  projDist,
  typeDist,
  cliRoot,
  cliDist,
  indexDist,
  iconDist,
};
