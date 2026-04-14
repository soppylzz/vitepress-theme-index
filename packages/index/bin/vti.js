#!/usr/bin/env node
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { runtimeLogger } from "../dist/shared/index.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliPath = resolve(__dirname, "../dist/cli/cli.mjs");

import(cliPath).catch((err) => {
  runtimeLogger.error(err);
});
