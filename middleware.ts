import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Closure-based Rate Limiter (Token Bucket / Sliding Window in Memory)
 * Demonstrates:
 * 1. JavaScript Closures (encapsulating rate limit state)
 * 2. Next.js Edge Middleware
 * 3. System Design: Rate Limiting & Protection
 */
function createRateLimiter(maxRequests: number = 60, windowMs: number = 60000) {
  const ipRequests = new Map<string, { count: number; resetTime: number }>();

  return function isRateLimited(ip: string): { limited: boolean; remaining: number; resetInSec: number } {
    const now = Date.now();
    const userRecord = ipRequests.get(ip);

    // Clean up expired entry or initialize
    if (!userRecord || now > userRecord.resetTime) {
      ipRequests.set(ip, { count: 1, resetTime: now + windowMs });
      return { limited: false, remaining: maxRequests - 1, resetInSec: Math.ceil(windowMs / 1000) };
    }

    if (userRecord.count >= maxRequests) {
      const resetInSec = Math.ceil((userRecord.resetTime - now) / 1000);
      return { limited: true, remaining: 0, resetInSec };
    }

    userRecord.count += 1;
    return {
      limited: false,
      remaining: maxRequests - userRecord.count,
      resetInSec: Math.ceil((userRecord.resetTime - now) / 1000),
    };
  };
}

const checkRateLimit = createRateLimiter(100, 60000);

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

  // 1. Rate limiting on API routes
  if (pathname.startsWith('/api/')) {
    const rateLimit = checkRateLimit(clientIp);
    if (rateLimit.limited) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many requests. Please try again in ${rateLimit.resetInSec} seconds.`,
            statusCode: 429,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetInSec),
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
  }

  // 2. Auth Guard on protected API routes
  const isProtectedApi = pathname.startsWith('/api/github/') || pathname.startsWith('/api/notes');
  const token = request.cookies.get('gittower_github_token')?.value;

  if (isProtectedApi && !token) {
    // Return 401 JSON for API requests
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please connect your GitHub account.',
          statusCode: 401,
        },
      },
      { status: 401 }
    );
  }

  // 3. Clone response and inject security & telemetry headers
  const response = NextResponse.next();
  const duration = Date.now() - startTime;

  response.headers.set('X-Request-Id', crypto.randomUUID());
  response.headers.set('X-Middleware-Latency', `${duration}ms`);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
