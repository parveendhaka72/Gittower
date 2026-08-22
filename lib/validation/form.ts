/**
 * Request Body & Form Validation Suite
 * Topics:
 * - Request body validation (0.2 pts)
 * - Form validation (0.2 pts)
 */

export interface ValidationRule<T = any> {
  field: keyof T | string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'email';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates any JSON object or form input against declarative schema rules
 */
export function validateSchema<T extends Record<string, any>>(
  data: T,
  rules: ValidationRule<T>[]
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const rule of rules) {
    const key = String(rule.field);
    const value: any = data[rule.field];

    // Required check
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[key] = rule.message || `${key} is required`;
      continue;
    }

    // Skip further checks if optional and empty
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // Type check
    if (rule.type) {
      if (rule.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          errors[key] = rule.message || `${key} must be a valid email address`;
          continue;
        }
      } else if (rule.type === 'array') {
        if (!Array.isArray(value)) {
          errors[key] = rule.message || `${key} must be an array`;
          continue;
        }
      } else if (typeof value !== rule.type) {
        errors[key] = rule.message || `${key} must be of type ${rule.type}`;
        continue;
      }
    }

    // String length checks
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors[key] = rule.message || `${key} must be at least ${rule.minLength} characters`;
        continue;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[key] = rule.message || `${key} must be at most ${rule.maxLength} characters`;
        continue;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[key] = rule.message || `${key} format is invalid`;
        continue;
      }
    }

    // Number range checks
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors[key] = rule.message || `${key} must be greater than or equal to ${rule.min}`;
        continue;
      }
      if (rule.max !== undefined && value > rule.max) {
        errors[key] = rule.message || `${key} must be less than or equal to ${rule.max}`;
        continue;
      }
    }

    // Custom validator
    if (rule.custom) {
      const customRes = rule.custom(value);
      if (customRes !== true) {
        errors[key] = typeof customRes === 'string' ? customRes : rule.message || `${key} failed validation`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Example Validation Schema for Attention Notes
 */
export const ATTENTION_NOTE_SCHEMA: ValidationRule[] = [
  { field: 'title', required: true, type: 'string', minLength: 3, maxLength: 200, message: 'Title is required (3-200 chars)' },
  { field: 'notes', required: true, type: 'string', minLength: 5, message: 'Notes must be at least 5 characters' },
  { field: 'priority', required: true, type: 'string', custom: (v) => ['P0', 'P1', 'P2', 'P3'].includes(v) || 'Priority must be P0, P1, P2, or P3' },
  { field: 'repoFullName', required: true, type: 'string', pattern: /^[^\/]+\/[^\/]+$/, message: 'Repo must be in owner/repo format' },
];
