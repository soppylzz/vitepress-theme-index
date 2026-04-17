// Search index item for new design - split by titles
interface SearchIndexItem {
  post: string; // hash of PostInfo
  id: string; // combination of post hash + title order hash
  titles: string[]; // title path
  content: string; // paragraph content
}

type SearchIndex = SearchIndexItem[];

interface SearchItem {
  id: string;
  path: string;
  locale: string;
  titles: string[];
  content: string;
}

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

// Locale-aware build results
type LocaleSearchIndexRecord = Record<string, SearchIndex>;
type LocaleArchiveStatsRecord = Record<string, ArchiveAllStats>;

interface BuildResult {
  searchIndex: LocaleSearchIndexRecord;
  statRecord: LocaleArchiveStatsRecord;
  allPostInfo: PostInfo[];
}

export type {
  SearchIndex,
  SearchIndexItem,
  SearchItem,
  GitInfo,
  PostInfo,
  ArchiveData,
  ArchiveStat,
  ArchiveAllStats,
  LocaleSearchIndexRecord,
  LocaleArchiveStatsRecord,
  BuildResult,
};
