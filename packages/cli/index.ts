import { cliLogger } from "@vitepress-theme-index/shared";
import { query, scaffold } from "./src";

async function cli() {
  const options = await query();
  await scaffold(options);
}

cli().catch((err) => {
  cliLogger.error(err);
  process.exit(1);
});
