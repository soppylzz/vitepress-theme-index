import { resolve } from "node:path";

/* =============== build config =============== */
const projRoot = resolve(__dirname, "..", "..", "..");
const pkgRoot = resolve(projRoot, "packages");

const clientRoot = resolve(pkgRoot, "client");
const nodeRoot = resolve(pkgRoot, "node");
const sharedRoot = resolve(pkgRoot, "shared");
const themeRoot = resolve(pkgRoot, "theme");

const indexRoot = resolve(pkgRoot, "index");

const projDist = resolve(projRoot, "dist", "dist");
const typeDist = resolve(projRoot, "dist", "types", "packages");

export {
  projRoot,
  pkgRoot,
  clientRoot,
  nodeRoot,
  sharedRoot,
  themeRoot,
  indexRoot,
  projDist,
  typeDist,
};
