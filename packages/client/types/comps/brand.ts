import type { IndexLink, IndexSize, IndexText } from "../global";

interface BrandProps extends Partial<IndexLink> {
  text: IndexText;
  brand?: string;
  size?: IndexSize;
  direction?: "row" | "column";
}

export type { BrandProps };
