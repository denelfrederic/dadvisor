
// Types for the knowledge base
export interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  source?: string;
  user_id?: string; // To associate entries with specific users
  created_at?: string;
  updated_at?: string;
  embedding?: any; // Optional embedding field
}

export interface KnowledgeBaseStats {
  count: number;
  categories?: Record<string, number>;
  categoriesCount?: number;
  withEmbeddings?: number;
}

export interface KnowledgeBaseOperations {
  addEntry: (entry: Omit<KnowledgeEntry, 'id'>) => Promise<KnowledgeEntry | null>;
  updateEntry: (id: string, entry: Partial<KnowledgeEntry>) => Promise<boolean>;
  deleteEntry: (id: string) => Promise<boolean>;
  getEntries: () => Promise<KnowledgeEntry[]>;
  searchEntries: (query: string) => Promise<KnowledgeEntry[]>;
}

export interface CombinedReport {
  knowledgeBase: KnowledgeBaseStats;
  documents: {
    total: number;
    withEmbeddings: number;
    withoutEmbeddings: number;
    percentage: number;
  };
}
