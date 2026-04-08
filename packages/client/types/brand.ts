import type { IndexSize, IndexTextLink } from "./global";

interface BrandProps extends IndexTextLink {
  brand?: string;
  size?: IndexSize;
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
}

export type { BrandProps };
