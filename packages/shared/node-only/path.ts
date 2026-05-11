import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// due to a design error on my part, I have to redefine the path parameter here.
const __dirname = dirname(fileURLToPath(import.meta.url));

const pkgRoot = resolve(__dirname, "..", "..");

const cliRoot = resolve(pkgRoot, "cli");
const clientRoot = resolve(pkgRoot, "client");
const nodeRoot = resolve(pkgRoot, "node");
const iconRoot = resolve(pkgRoot, "icons");

export { pkgRoot, cliRoot, clientRoot, nodeRoot, iconRoot };
