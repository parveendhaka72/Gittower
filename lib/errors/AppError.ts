/**
 * Centralized Application Error Classes with HTTP Status Codes
 * Demonstrates clean server-side error handling & problem modeling.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 Bad Request */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: any) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

/** 401 Unauthorized */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required', details?: any) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

/** 403 Forbidden */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden', details?: any) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

/** 404 Not Found */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

/** 422 Unprocessable Entity / Validation Error */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

/** 429 Too Many Requests */
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Rate limit exceeded. Try again later.', details?: any) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
  }
}

/** 500 Internal Server Error */
export class InternalServerError extends AppError {
  constructor(message: string = 'An unexpected internal error occurred', details?: any) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details, false);
  }
}
