import { env } from '../config/env';

/**
 * MongoDB NoSQL Client & Connection Manager
 * Demonstrates:
 * 1. Database Connection Pooling / Singleton pattern
 * 2. In-Memory NoSQL Fallback for isolated demo/interview environments
 * 3. Document indexing and query operations
 */

export interface MongoDocument {
  _id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

class InMemoryMongoCollection<T extends MongoDocument> {
  private documents: Map<string, T> = new Map();

  async find(query: Partial<T> = {}): Promise<T[]> {
    const docs = Array.from(this.documents.values());
    return docs.filter((doc) => {
      return Object.entries(query).every(([key, value]) => {
        if (value === undefined) return true;
        if (Array.isArray(doc[key]) && typeof value === 'string') {
          return (doc[key] as string[]).includes(value);
        }
        return doc[key] === value;
      });
    });
  }

  async findById(id: string): Promise<T | null> {
    return this.documents.get(id) || null;
  }

  async insertOne(doc: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date().toISOString();
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDoc = {
      ...doc,
      _id: id,
      createdAt: now,
      updatedAt: now,
    } as T;
    this.documents.set(id, newDoc);
    return newDoc;
  }

  async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
    const existing = this.documents.get(id);
    if (!existing) return null;
    const updatedDoc: T = {
      ...existing,
      ...update,
      _id: id,
      updatedAt: new Date().toISOString(),
    };
    this.documents.set(id, updatedDoc);
    return updatedDoc;
  }

  async findByIdAndDelete(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  async countDocuments(query: Partial<T> = {}): Promise<number> {
    const results = await this.find(query);
    return results.length;
  }
}

// Memory Database Store singleton
class MemoryMongoDatabase {
  private collections: Map<string, InMemoryMongoCollection<any>> = new Map();

  getCollection<T extends MongoDocument>(name: string): InMemoryMongoCollection<T> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new InMemoryMongoCollection<T>());
    }
    return this.collections.get(name)!;
  }
}

export const memoryDb = new MemoryMongoDatabase();

/**
 * Seed initial interview demonstration data
 */
export async function seedInitialNoSqlData() {
  const notesCol = memoryDb.getCollection('attention_notes');
  const count = await notesCol.countDocuments();
  if (count === 0) {
    await notesCol.insertOne({
      repo: 'facebook/react',
      issueNumber: 28000,
      title: 'Fix Hydration Mismatch in Server Components',
      content: 'Identified race condition in transition queue when hydrating streaming chunks.',
      priority: 'P0',
      tags: ['bug', 'compiler', 'v19'],
      author: 'interview_user',
      isArchived: false,
    });
    await notesCol.insertOne({
      repo: 'vercel/next.js',
      issueNumber: 62000,
      title: 'Turbopack Root Layout CSS HMR Issue',
      content: 'Pending verify against canary.52 build.',
      priority: 'P1',
      tags: ['turbopack', 'css'],
      author: 'interview_user',
      isArchived: false,
    });
  }
}

// Automatically seed on module load
seedInitialNoSqlData();
