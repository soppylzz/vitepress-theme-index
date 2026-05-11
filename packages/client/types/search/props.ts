import type { IndexAlign, IndexDirection, IndexIcon, IndexSize, IndexText } from "../global";
import type { MaybeArray } from "@vitepress-theme-index/shared";

type SearchTextHelp = {
  type: "text";
  help: IndexText;
};

type SearchKeyHelp = {
  type: "key";
  keys: MaybeArray<string>;
  help: IndexText;
};

type SearchHelpItem = SearchTextHelp | SearchKeyHelp;

interface SearchHelpProps {
  size?: IndexSize;
  align?: IndexAlign;
  direction?: IndexDirection;
  helps: SearchHelpItem[];
}

interface SearchLoadingProps {
  text: IndexText;
  icon?: IndexIcon;
  anime?: "scale" | "rotate";
}

export type { SearchHelpItem, SearchHelpProps, SearchLoadingProps };
