import { intro, text, select, confirm, outro, spinner, isCancel, cancel } from "@clack/prompts";

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

async function generate(args: any) {
  intro("vitepress with theme-index cli");
}
