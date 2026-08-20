import { withErrorHandler, jsonResponse } from '@/lib/errors/withErrorHandler';
import { 
  executeInnerJoinReviews, 
  executeLeftJoinBlockers, 
  executeBottleneckAnalytics, 
  SQL_QUERIES 
} from '@/lib/db/sql-queries';
import { POSTGRES_DDL_SCHEMA } from '@/lib/db/postgres';

/**
 * GET /api/analytics/bottlenecks
 * Demonstrates:
 * 1. Relational Schema Design (PK/FK constraints)
 * 2. SQL JOINs (INNER JOIN, LEFT JOIN, Aggregation)
 * 3. System Design: Cross-table analytics & bottleneck metrics
 */
export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url);
  const mode = url.searchParams.get('mode') || 'all';

  const innerJoinData = executeInnerJoinReviews();
  const leftJoinData = executeLeftJoinBlockers();
  const aggregateData = executeBottleneckAnalytics();

  return jsonResponse({
    schemaDDL: POSTGRES_DDL_SCHEMA,
    queries: SQL_QUERIES,
    results: {
      innerJoinReviews: innerJoinData,
      leftJoinBlockers: leftJoinData,
      bottleneckAnalytics: aggregateData,
    },
  }, 200);
});
