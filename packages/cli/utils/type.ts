interface IndexCliOptions {
  folder: string;
  siteName: string;
  prefix: string;
  i18n: boolean;
  useTs: boolean;
  mode: "docs" | "blog";
  addScript: boolean;
  dev?: boolean;
}

export type { IndexCliOptions };
