import { withErrorHandler, jsonResponse } from '@/lib/errors/withErrorHandler';
import { cronScheduler } from '@/lib/system';

/**
 * Scheduled Cron Job: Stale Pull Request Cleaner
 * Topic: Scheduled jobs / cron (0.3 pts)
 * Schedule: 0 0 * * * (Daily at midnight)
 */
export const GET = withErrorHandler(async () => {
  const result = await cronScheduler.triggerJob('stale-pr-cleaner');

  return jsonResponse({
    cronTask: 'stale-pr-cleaner',
    schedule: '0 0 * * *',
    executedAt: new Date().toISOString(),
    executionReport: result,
  });
});
