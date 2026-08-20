import { sqlEngine } from './postgres';

/**
 * SQL JOIN Demonstrations & Typed Query Services
 * Demonstrates:
 * 1. INNER JOIN: Combining matching records across multiple relational tables
 * 2. LEFT JOIN: Preserving left table records with nullable right table joins
 * 3. AGGREGATE JOIN: GROUP BY, COUNT, and AVG calculations across joined entities
 */

export interface InnerJoinReviewResult {
  reviewId: number;
  reviewStatus: string;
  turnaroundHours: number;
  prNumber: number;
  prTitle: string;
  repoName: string;
  authorUsername: string;
  reviewerUsername: string;
  reviewerAvatar: string;
}

export interface LeftJoinRepoBlockerResult {
  repoId: number;
  repoName: string;
  healthScore: number;
  blockerId: number | null;
  workflowName: string | null;
  errorMessage: string | null;
  severity: string | null;
}

export interface BottleneckAnalyticsResult {
  repoName: string;
  totalPrs: number;
  pendingReviewsCount: number;
  avgTurnaroundHours: number;
  activeBlockersCount: number;
  healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export const SQL_QUERIES = {
  // 1. INNER JOIN Query Text
  INNER_JOIN_REVIEWS: `
    SELECT 
      ra.id AS review_id,
      ra.status AS review_status,
      ra.turnaround_hours,
      pr.number AS pr_number,
      pr.title AS pr_title,
      r.full_name AS repo_name,
      author.username AS author_username,
      reviewer.username AS reviewer_username,
      reviewer.avatar_url AS reviewer_avatar
    FROM review_assignments ra
    INNER JOIN pull_requests pr ON ra.pr_id = pr.id
    INNER JOIN repositories r ON pr.repo_id = r.id
    INNER JOIN users author ON pr.author_id = author.id
    INNER JOIN users reviewer ON ra.reviewer_id = reviewer.id
    WHERE pr.state = 'open';
  `,

  // 2. LEFT JOIN Query Text
  LEFT_JOIN_BLOCKERS: `
    SELECT 
      r.id AS repo_id,
      r.full_name AS repo_name,
      r.health_score,
      wb.id AS blocker_id,
      wb.workflow_name,
      wb.error_message,
      wb.severity
    FROM repositories r
    LEFT JOIN workflow_blockers wb ON r.id = wb.repo_id AND wb.status = 'ACTIVE'
    ORDER BY r.full_name ASC;
  `,

  // 3. AGGREGATE JOIN Query Text
  AGGREGATE_BOTTLENECKS: `
    SELECT 
      r.full_name AS repo_name,
      COUNT(DISTINCT pr.id) AS total_prs,
      COUNT(DISTINCT CASE WHEN ra.status = 'PENDING' THEN ra.id END) AS pending_reviews_count,
      ROUND(AVG(COALESCE(ra.turnaround_hours, 0)), 2) AS avg_turnaround_hours,
      COUNT(DISTINCT wb.id) AS active_blockers_count
    FROM repositories r
    LEFT JOIN pull_requests pr ON r.id = pr.repo_id AND pr.state = 'open'
    LEFT JOIN review_assignments ra ON pr.id = ra.pr_id
    LEFT JOIN workflow_blockers wb ON r.id = wb.repo_id AND wb.status = 'ACTIVE'
    GROUP BY r.id, r.full_name
    ORDER BY pending_reviews_count DESC, avg_turnaround_hours DESC;
  `,
};

/**
 * Executes INNER JOIN query
 */
export function executeInnerJoinReviews(): InnerJoinReviewResult[] {
  const results: InnerJoinReviewResult[] = [];

  sqlEngine.reviewAssignments.forEach((ra) => {
    const pr = sqlEngine.pullRequests.find((p) => p.id === ra.pr_id && p.state === 'open');
    if (!pr) return;

    const repo = sqlEngine.repositories.find((r) => r.id === pr.repo_id);
    const author = sqlEngine.users.find((u) => u.id === pr.author_id);
    const reviewer = sqlEngine.users.find((u) => u.id === ra.reviewer_id);

    if (repo && author && reviewer) {
      results.push({
        reviewId: ra.id,
        reviewStatus: ra.status,
        turnaroundHours: ra.turnaround_hours || 0,
        prNumber: pr.number,
        prTitle: pr.title,
        repoName: repo.full_name,
        authorUsername: author.username,
        reviewerUsername: reviewer.username,
        reviewerAvatar: reviewer.avatar_url,
      });
    }
  });

  return results;
}

/**
 * Executes LEFT JOIN query
 */
export function executeLeftJoinBlockers(): LeftJoinRepoBlockerResult[] {
  const results: LeftJoinRepoBlockerResult[] = [];

  sqlEngine.repositories.forEach((repo) => {
    const blockers = sqlEngine.workflowBlockers.filter((b) => b.repo_id === repo.id && b.status === 'ACTIVE');

    if (blockers.length === 0) {
      results.push({
        repoId: repo.id,
        repoName: repo.full_name,
        healthScore: repo.health_score,
        blockerId: null,
        workflowName: null,
        errorMessage: null,
        severity: null,
      });
    } else {
      blockers.forEach((b) => {
        results.push({
          repoId: repo.id,
          repoName: repo.full_name,
          healthScore: repo.health_score,
          blockerId: b.id,
          workflowName: b.workflow_name,
          errorMessage: b.error_message,
          severity: b.severity,
        });
      });
    }
  });

  return results;
}

/**
 * Executes AGGREGATE JOIN query for Team Bottlenecks
 */
export function executeBottleneckAnalytics(): BottleneckAnalyticsResult[] {
  return sqlEngine.repositories.map((repo) => {
    const prs = sqlEngine.pullRequests.filter((p) => p.repo_id === repo.id && p.state === 'open');
    const prIds = new Set(prs.map((p) => p.id));

    const reviews = sqlEngine.reviewAssignments.filter((ra) => prIds.has(ra.pr_id));
    const pendingReviews = reviews.filter((ra) => ra.status === 'PENDING');
    const blockers = sqlEngine.workflowBlockers.filter((b) => b.repo_id === repo.id && b.status === 'ACTIVE');

    const totalTurnaround = reviews.reduce((sum, r) => sum + (r.turnaround_hours || 0), 0);
    const avgTurnaround = reviews.length > 0 ? Number((totalTurnaround / reviews.length).toFixed(1)) : 0;

    let healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    if (blockers.length > 0 || avgTurnaround > 24) {
      healthStatus = 'CRITICAL';
    } else if (pendingReviews.length > 2 || avgTurnaround > 8) {
      healthStatus = 'WARNING';
    }

    return {
      repoName: repo.full_name,
      totalPrs: prs.length,
      pendingReviewsCount: pendingReviews.length,
      avgTurnaroundHours: avgTurnaround,
      activeBlockersCount: blockers.length,
      healthStatus,
    };
  });
}
