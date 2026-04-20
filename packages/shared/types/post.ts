interface SearchIndexItem {
  id: string;
  path: string;
  titles: string[];
  content: string;
}

type SearchIndex = SearchIndexItem[];

interface GitInfo {
  firstCommit: number;
  lastCommit: number;
  isFallback: boolean;
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

type LocaleSearchIndexRecord = Record<string, SearchIndex>;
type LocaleArchiveStatsRecord = Record<string, ArchiveAllStats>;

interface BuildResult {
  searchIndex: LocaleSearchIndexRecord;
  archiveRecord: LocaleArchiveStatsRecord;
  allPostInfo: PostInfo[];
}

export type {
  SearchIndex,
  SearchIndexItem,
  GitInfo,
  PostInfo,
  ArchiveData,
  ArchiveStat,
  ArchiveAllStats,
  LocaleSearchIndexRecord,
  LocaleArchiveStatsRecord,
  BuildResult,
};
