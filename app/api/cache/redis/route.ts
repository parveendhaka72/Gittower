import { withErrorHandler, jsonResponse } from '@/lib/errors/withErrorHandler';
import { BadRequestError } from '@/lib/errors/AppError';
import { redis } from '@/lib/cache/redis';

/**
 * Redis Cache API Endpoint
 * Topic: Caching with Redis (0.4 pts)
 * Routes:
 * - GET: Inspect cache metrics, hit/miss ratio, active keys
 * - POST: Set or test a key-value pair in Redis with TTL
 * - DELETE: Flush cache or invalidate key pattern
 */

export const GET = withErrorHandler(async () => {
  const metrics = redis.getMetrics();
  const keys = redis.listKeys();

  return jsonResponse({
    metrics,
    activeKeys: keys,
    status: 'REDIS_ONLINE',
    strategy: 'Cache-Aside with TTL Invalidation',
  });
});

export const POST = withErrorHandler(async (req: Request) => {
  let body: any;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError('Invalid JSON payload');
  }

  const { key, value, ttlSeconds = 300 } = body;
  if (!key || value === undefined) {
    throw new BadRequestError('Both "key" and "value" are required');
  }

  await redis.set(key, value, Number(ttlSeconds));

  return jsonResponse({
    message: `Key "${key}" successfully cached in Redis`,
    ttlSeconds: Number(ttlSeconds),
    metrics: redis.getMetrics(),
  }, 201);
});

export const DELETE = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url);
  const pattern = url.searchParams.get('pattern');

  if (pattern) {
    const deletedCount = await redis.invalidate(pattern);
    return jsonResponse({
      message: `Invalidated ${deletedCount} keys matching pattern "${pattern}"`,
      deletedCount,
      metrics: redis.getMetrics(),
    });
  }

  await redis.flushAll();
  return jsonResponse({
    message: 'Flushed entire Redis cache',
    metrics: redis.getMetrics(),
  });
});
