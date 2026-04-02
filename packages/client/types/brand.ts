import type { IndexLink, IndexSize, IndexText } from "./global";

interface BrandProps extends IndexLink {
  text: IndexText;
  brand?: string;
  size?: IndexSize;
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
}

export type { BrandProps };
