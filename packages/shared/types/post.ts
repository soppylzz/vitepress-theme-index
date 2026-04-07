import type { MaybeArray } from "./utils";

interface GitInfo {
  firstCommit: number;
  lastCommit: number;
  isFallback: boolean;
}

interface PostMetaInfo extends GitInfo {
  path: string;
  hash: string;
  content: string;
  frontmatter: Record<string, any>;
}

type IndexPostArchives = Record<string, Omit<PostMetaInfo, "content">[]>;
interface IndexPostPlugin {
  name: string;
  extract: (post: PostMetaInfo) => MaybeArray<string> | null | undefined;
  postProcess?: (map: IndexPostArchives) => IndexPostArchives;
}

export type { PostMetaInfo, GitInfo, IndexPostPlugin, IndexPostArchives };
