type SearchIndex = Array<{ id: string; content: string }>;

interface GitInfo {
  firstCommit: number;
  lastCommit: number;
  isFallback: boolean;
}

interface PostRawData extends PostInfo {
  content: string;
}

interface PostInfo extends GitInfo {
  path: string;
  hash: string;
  frontmatter: Record<string, any>;
}

type ArchiveData = Record<string, PostInfo[]>;
type ArchiveStat = {
  pageSize: number;
  record: Record<
    string,
    {
      url: string;
      total: number;
    }
  >;
};

type ArchiveAllStats = Record<string, ArchiveStat>;

export type {
  SearchIndex,
  GitInfo,
  PostInfo,
  PostRawData,
  ArchiveData,
  ArchiveStat,
  ArchiveAllStats,
};
