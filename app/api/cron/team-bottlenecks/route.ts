import { withErrorHandler, jsonResponse } from '@/lib/errors/withErrorHandler';
import { cronScheduler } from '@/lib/system';

/**
 * Scheduled Cron Job: Team Bottleneck Sync
 * Topic: Scheduled jobs / cron (0.3 pts)
 * Schedule: * /30 * * * * (Every 30 minutes)
 */
export const GET = withErrorHandler(async () => {
  const result = await cronScheduler.triggerJob('team-bottleneck-sync');

  return jsonResponse({
    cronTask: 'team-bottleneck-sync',
    schedule: '*/30 * * * *',
    executedAt: new Date().toISOString(),
    executionReport: result,
  });
});
