import { cancel, confirm, intro, isCancel, outro, select, text } from "@clack/prompts";
import type { IndexCliOptions } from "./type";
import mri from "mri";

async function safe<T>(p: Promise<T | symbol>): Promise<T> {
  const res = await p;
  if (isCancel(res)) {
    cancel("operation cancelled");
    process.exit(0);
  }
  return res;
}

async function query(): Promise<IndexCliOptions> {
  intro("vitepress with theme-index");
  const args = mri(process.argv.slice(2));

  const folder = await safe(
    text({
      message: "vitepress directory (where your docs are stored)?",
      placeholder: "./docs",
      defaultValue: "./docs",
    })
  );

  const siteName = await safe(
    text({
      message: "site name (appears in header and title)?",
      placeholder: "hello vitepress",
      defaultValue: "hello vitepress",
    })
  );

  const i18n = await safe(
    confirm({
      message: "enable i18n multi-language support?",
      initialValue: true,
    })
  );

  const useTs = await safe(
    confirm({
      message: "use typescript for configuration files?",
      initialValue: true,
    })
  );

  const mode = await safe(
    select({
      message: "choose index layout?",
      options: [
        { label: "docs - document website", value: "docs" },
        { label: "blog - blog with posts", value: "blog" },
      ],
    })
  );

  const addScript = await safe(
    confirm({
      message: "add vitepress scripts to package.json?",
      initialValue: true,
    })
  );

  let prefix: string | symbol = "docs";

  if (addScript) {
    prefix = await safe(
      text({
        message: 'npm script prefix (e.g. "docs:dev")',
        placeholder: "docs",
        defaultValue: "docs",
      })
    );
  }

  return {
    folder,
    siteName,
    i18n,
    useTs,
    mode,
    addScript,
    prefix,
    dev: args.dev || args.d,
  };
}

export { query };
