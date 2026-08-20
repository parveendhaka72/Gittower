import { memoryDb, MongoDocument } from '../mongodb';

/**
 * NoSQL Schema Modeling: AttentionNote
 * Represents developer notes, priority tags, and private triage metadata for PRs/issues.
 */
export interface AttentionNoteDocument extends MongoDocument {
  repo: string;
  issueNumber: number;
  title: string;
  content: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  tags: string[];
  author: string;
  isArchived: boolean;
}

export const AttentionNoteModel = {
  collection: () => memoryDb.getCollection<AttentionNoteDocument>('attention_notes'),

  async create(data: {
    repo: string;
    issueNumber: number;
    title: string;
    content: string;
    priority?: 'P0' | 'P1' | 'P2' | 'P3';
    tags?: string[];
    author?: string;
  }): Promise<AttentionNoteDocument> {
    return this.collection().insertOne({
      repo: data.repo,
      issueNumber: data.issueNumber,
      title: data.title,
      content: data.content,
      priority: data.priority || 'P2',
      tags: data.tags || [],
      author: data.author || 'developer',
      isArchived: false,
    });
  },

  async findMany(query: {
    repo?: string;
    issueNumber?: number;
    priority?: string;
    tag?: string;
    isArchived?: boolean;
  }): Promise<AttentionNoteDocument[]> {
    const filter: any = {};
    if (query.repo) filter.repo = query.repo;
    if (query.issueNumber !== undefined) filter.issueNumber = Number(query.issueNumber);
    if (query.priority) filter.priority = query.priority;
    if (query.isArchived !== undefined) filter.isArchived = query.isArchived;
    if (query.tag) filter.tags = query.tag;

    return this.collection().find(filter);
  },

  async findById(id: string): Promise<AttentionNoteDocument | null> {
    return this.collection().findById(id);
  },

  async update(id: string, updates: Partial<AttentionNoteDocument>): Promise<AttentionNoteDocument | null> {
    return this.collection().findByIdAndUpdate(id, updates);
  },

  async delete(id: string): Promise<boolean> {
    return this.collection().findByIdAndDelete(id);
  },
};
