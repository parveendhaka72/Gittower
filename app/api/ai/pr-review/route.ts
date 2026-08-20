import { withErrorHandler, jsonResponse } from '@/lib/errors/withErrorHandler';
import { BadRequestError } from '@/lib/errors/AppError';
import { reviewPRWithGemini } from '@/lib/ai/gemini';
import { PRContext } from '@/lib/ai/prompts';

/**
 * POST /api/ai/pr-review
 * Demonstrates:
 * - Automated Code Review with Gemini LLM
 * - Structured Checklist & Readiness State
 * - RESTful standards & HTTP Status 200/400
 */
export const POST = withErrorHandler(async (req: Request) => {
  let body: any;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError('Invalid JSON payload in request body');
  }

  const { title, repo, number, author, prBody, headBranch, baseBranch, checkRuns, mergeable } = body;

  if (!title || !repo || number === undefined) {
    throw new BadRequestError('Missing required fields: title, repo, number');
  }

  const context: PRContext = {
    title,
    repo,
    number: Number(number),
    author: author || 'unknown',
    body: prBody || '',
    state: 'open',
    headBranch,
    baseBranch,
    checkRuns: Array.isArray(checkRuns) ? checkRuns : [],
    mergeable: mergeable !== undefined ? !!mergeable : undefined,
    isPullRequest: true,
  };

  const review = await reviewPRWithGemini(context);

  return jsonResponse(review, 200);
});
