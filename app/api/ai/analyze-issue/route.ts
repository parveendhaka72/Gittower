import { withErrorHandler, jsonResponse } from '@/lib/errors/withErrorHandler';
import { BadRequestError } from '@/lib/errors/AppError';
import { analyzeIssueWithGemini } from '@/lib/ai/gemini';
import { IssueContext } from '@/lib/ai/prompts';

/**
 * POST /api/ai/analyze-issue
 * Demonstrates:
 * - LLM API Integration (Gemini 2.0/2.5)
 * - Prompt Engineering (Role, Chain of Thought)
 * - Structured Output JSON Schema
 * - Server-side Error Handling & HTTP Status Codes (200, 400, 500)
 */
export const POST = withErrorHandler(async (req: Request) => {
  let body: any;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError('Invalid JSON payload in request body');
  }

  const { title, repo, number, author, issueBody, state, comments, labels, isPullRequest } = body;

  if (!title || !repo || number === undefined) {
    throw new BadRequestError('Missing required fields: title, repo, number');
  }

  const context: IssueContext = {
    title,
    repo,
    number: Number(number),
    author: author || 'unknown',
    body: issueBody || '',
    state: state || 'open',
    comments: Array.isArray(comments) ? comments : [],
    labels: Array.isArray(labels) ? labels : [],
    isPullRequest: !!isPullRequest,
  };

  const analysis = await analyzeIssueWithGemini(context);

  return jsonResponse(analysis, 200);
});
