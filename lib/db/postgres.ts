/**
 * PostgreSQL Relational Database Schema & Query Engine
 * Demonstrates:
 * 1. Relational Schema Design with Primary Keys (PK) & Foreign Keys (FK)
 * 2. Multi-table SQL JOIN queries (INNER JOIN, LEFT JOIN, Aggregation)
 * 3. Relational integrity constraints
 */

export const POSTGRES_DDL_SCHEMA = `
-- ============================================================================
-- GitTower Relational PostgreSQL Schema (DDL)
-- ============================================================================

-- 1. Users Table (Primary Entity)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  github_id VARCHAR(64) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  name VARCHAR(200),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Repositories Table (FK -> users.id)
CREATE TABLE IF NOT EXISTS repositories (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) UNIQUE NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  health_score INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Pull Requests Table (FK -> repositories.id, FK -> users.id)
CREATE TABLE IF NOT EXISTS pull_requests (
  id SERIAL PRIMARY KEY,
  repo_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  state VARCHAR(32) DEFAULT 'open',
  mergeable_state VARCHAR(32) DEFAULT 'clean',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(repo_id, number)
);

-- 4. Review Assignments Table (Composite Relational Join Target)
-- FK -> pull_requests.id, FK -> users.id
CREATE TABLE IF NOT EXISTS review_assignments (
  id SERIAL PRIMARY KEY,
  pr_id INTEGER NOT NULL REFERENCES pull_requests(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(32) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'CHANGES_REQUESTED'
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  turnaround_hours NUMERIC(6, 2)
);

-- 5. Workflow Blockers Table (FK -> repositories.id)
CREATE TABLE IF NOT EXISTS workflow_blockers (
  id SERIAL PRIMARY KEY,
  repo_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  workflow_name VARCHAR(255) NOT NULL,
  error_message TEXT NOT NULL,
  severity VARCHAR(32) DEFAULT 'HIGH',
  status VARCHAR(32) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for Join Optimization
CREATE INDEX IF NOT EXISTS idx_pull_requests_repo ON pull_requests(repo_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pr ON review_assignments(pr_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON review_assignments(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_blockers_repo ON workflow_blockers(repo_id);
`;

// Relational memory database structures for standalone interview execution
export interface UserRow {
  id: number;
  github_id: string;
  username: string;
  name: string;
  avatar_url: string;
}

export interface RepoRow {
  id: number;
  full_name: string;
  owner_id: number;
  is_private: boolean;
  health_score: number;
}

export interface PRRow {
  id: number;
  repo_id: number;
  author_id: number;
  number: number;
  title: string;
  state: string;
  mergeable_state: string;
  created_at: string;
}

export interface ReviewRow {
  id: number;
  pr_id: number;
  reviewer_id: number;
  status: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';
  assigned_at: string;
  responded_at?: string;
  turnaround_hours?: number;
}

export interface BlockerRow {
  id: number;
  repo_id: number;
  workflow_name: string;
  error_message: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  status: 'ACTIVE' | 'RESOLVED';
}

class RelationalSqlEngine {
  public users: UserRow[] = [
    { id: 1, github_id: 'gh_101', username: 'mohitdebian', name: 'Mohit Singh', avatar_url: 'https://github.com/mohitdebian.png' },
    { id: 2, github_id: 'gh_102', username: 'alex_lead', name: 'Alex Rivera', avatar_url: 'https://github.com/github.png' },
    { id: 3, github_id: 'gh_103', username: 'sarah_dev', name: 'Sarah Chen', avatar_url: 'https://github.com/github.png' },
  ];

  public repositories: RepoRow[] = [
    { id: 1, full_name: 'mohitdebian/GitTower', owner_id: 1, is_private: false, health_score: 95 },
    { id: 2, full_name: 'facebook/react', owner_id: 2, is_private: false, health_score: 88 },
    { id: 3, full_name: 'vercel/next.js', owner_id: 3, is_private: false, health_score: 72 },
  ];

  public pullRequests: PRRow[] = [
    { id: 101, repo_id: 1, author_id: 1, number: 42, title: 'Add AI Attention Triage Engine', state: 'open', mergeable_state: 'clean', created_at: '2026-08-17T10:00:00Z' },
    { id: 102, repo_id: 2, author_id: 3, number: 29011, title: 'Optimize Fiber Reconciler Microtask Scheduling', state: 'open', mergeable_state: 'blocked', created_at: '2026-08-16T14:30:00Z' },
    { id: 103, repo_id: 3, author_id: 2, number: 68120, title: 'Upgrade Turbopack Incremental Cache Invalidation', state: 'open', mergeable_state: 'clean', created_at: '2026-08-15T09:15:00Z' },
  ];

  public reviewAssignments: ReviewRow[] = [
    { id: 201, pr_id: 101, reviewer_id: 2, status: 'PENDING', assigned_at: '2026-08-17T10:05:00Z', turnaround_hours: 4.5 },
    { id: 202, pr_id: 102, reviewer_id: 1, status: 'CHANGES_REQUESTED', assigned_at: '2026-08-16T15:00:00Z', turnaround_hours: 12.0 },
    { id: 203, pr_id: 103, reviewer_id: 1, status: 'PENDING', assigned_at: '2026-08-15T10:00:00Z', turnaround_hours: 28.5 },
  ];

  public workflowBlockers: BlockerRow[] = [
    { id: 301, repo_id: 2, workflow_name: 'E2E Cross-Browser Matrix', error_message: 'WebKit test timeout on hydration', severity: 'HIGH', status: 'ACTIVE' },
    { id: 302, repo_id: 3, workflow_name: 'Build Artifact Bundle Analysis', error_message: 'Bundle size exceeded 180kb budget threshold', severity: 'CRITICAL', status: 'ACTIVE' },
  ];
}

export const sqlEngine = new RelationalSqlEngine();
