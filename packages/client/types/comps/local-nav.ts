interface LNavDocsContext {
  type: "docs";
  closeToc(): void;
}

type LNavContext = LNavDocsContext;

export type { LNavContext, LNavDocsContext };
