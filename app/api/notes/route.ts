import { withErrorHandler, jsonResponse } from '@/lib/errors/withErrorHandler';
import { BadRequestError } from '@/lib/errors/AppError';
import { AttentionNoteModel } from '@/lib/db/models/AttentionNote';

/**
 * NoSQL CRUD Operations: Notes Collection
 * Demonstrates:
 * - GET: Read / List with filtering
 * - POST: Create new document with validation (HTTP 201 Created)
 */

export const GET = withErrorHandler(async (req: Request) => {
  const url = new URL(req.url);
  const repo = url.searchParams.get('repo') || undefined;
  const issueNumber = url.searchParams.get('issueNumber') ? Number(url.searchParams.get('issueNumber')) : undefined;
  const priority = url.searchParams.get('priority') || undefined;
  const tag = url.searchParams.get('tag') || undefined;

  const notes = await AttentionNoteModel.findMany({
    repo,
    issueNumber,
    priority,
    tag,
    isArchived: false,
  });

  return jsonResponse(notes, 200);
});

export const POST = withErrorHandler(async (req: Request) => {
  let body: any;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError('Invalid JSON body');
  }

  const { repo, issueNumber, title, content, priority, tags, author } = body;

  if (!repo || issueNumber === undefined || !title || !content) {
    throw new BadRequestError('Missing required fields: repo, issueNumber, title, content');
  }

  const createdNote = await AttentionNoteModel.create({
    repo,
    issueNumber: Number(issueNumber),
    title,
    content,
    priority,
    tags,
    author,
  });

  // Return HTTP 201 Created
  return jsonResponse(createdNote, 201);
});
