import { withErrorHandler, jsonResponse } from '@/lib/errors/withErrorHandler';
import { NotFoundError, BadRequestError } from '@/lib/errors/AppError';
import { AttentionNoteModel } from '@/lib/db/models/AttentionNote';

/**
 * NoSQL CRUD Operations: Single Note Document
 * Demonstrates:
 * - PATCH: Partial Update (HTTP 200)
 * - DELETE: Resource Deletion (HTTP 200)
 */

export const PATCH = withErrorHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  const id = params?.id;

  if (!id) {
    throw new BadRequestError('Note ID is required');
  }

  let updates: any;
  try {
    updates = await req.json();
  } catch {
    throw new BadRequestError('Invalid JSON payload');
  }

  const updated = await AttentionNoteModel.update(id, updates);
  if (!updated) {
    throw new NotFoundError(`Note with id '${id}' not found`);
  }

  return jsonResponse(updated, 200);
});

export const DELETE = withErrorHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  const id = params?.id;

  if (!id) {
    throw new BadRequestError('Note ID is required');
  }

  const deleted = await AttentionNoteModel.delete(id);
  if (!deleted) {
    throw new NotFoundError(`Note with id '${id}' not found`);
  }

  return jsonResponse({ message: 'Note deleted successfully', id }, 200);
});
