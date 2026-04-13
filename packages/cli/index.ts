import { cliLogger } from "@vitepress-theme-index/shared";
import { queryByClackPrompt } from "./utils";

interface IndexCliOptions {
  folder: string;
  siteName: string;
  i18n: boolean;
  ts: boolean;
  mode: "docs" | "blog";
  addScript: boolean;
  prefix: string;
  dev?: boolean;
}

async function cli() {
  const options = await queryByClackPrompt();
}

cli().catch((err) => {
  cliLogger.error(err);
  process.exit(1);
});
