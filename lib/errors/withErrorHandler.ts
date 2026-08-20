import { NextResponse } from 'next/server';
import { AppError } from './AppError';

export type RouteHandler<T = any> = (
  req: Request,
  context: T
) => Promise<NextResponse | Response>;

/**
 * Standard API Response Envelope
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    statusCode: number;
    details?: any;
  };
  meta?: {
    timestamp: string;
    path?: string;
  };
}

/**
 * Higher-Order Function to wrap Next.js Route Handlers with uniform error handling.
 * Enforces correct HTTP status codes, structured error payloads, and diagnostic logging.
 */
export function withErrorHandler<T = any>(
  handler: (req: Request, context: T) => Promise<NextResponse | Response>
) {
  return async (req: Request, context: T): Promise<NextResponse | Response> => {
    const startTime = performance.now();
    const url = new URL(req.url);

    try {
      const response = await handler(req, context);
      
      // Inject response time header if response is NextResponse
      if (response instanceof NextResponse) {
        const duration = Math.round(performance.now() - startTime);
        response.headers.set('X-Response-Time', `${duration}ms`);
      }

      return response;
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      const isAppError = err instanceof AppError;

      const statusCode = isAppError ? err.statusCode : 500;
      const errorCode = isAppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
      const message = err.message || 'An unexpected error occurred';
      const details = isAppError ? err.details : undefined;

      // Log server errors for observability
      if (statusCode >= 500) {
        console.error(`[API Error 500] ${req.method} ${url.pathname}:`, err);
      } else {
        console.warn(`[API Client Error ${statusCode}] ${req.method} ${url.pathname} (${errorCode}):`, message);
      }

      const errorPayload: ApiResponse = {
        success: false,
        error: {
          code: errorCode,
          message,
          statusCode,
          details,
        },
        meta: {
          timestamp: new Date().toISOString(),
          path: url.pathname,
        },
      };

      const res = NextResponse.json(errorPayload, { status: statusCode });
      res.headers.set('X-Response-Time', `${duration}ms`);
      return res;
    }
  };
}

/**
 * Helper to build standard success responses
 */
export function jsonResponse<T>(data: T, status: number = 200, headers?: HeadersInit): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status, headers }
  );
}
