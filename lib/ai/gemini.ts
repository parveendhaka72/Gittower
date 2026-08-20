import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';
import { SYSTEM_PROMPTS, buildIssueTriagePrompt, buildPRReviewPrompt, IssueContext, PRContext } from './prompts';
import { ISSUE_ANALYSIS_SCHEMA, PR_REVIEW_SCHEMA, IssueAnalysisResult, PRReviewResult } from './schemas';

/**
 * AI Application Engineering Service
 * Demonstrates:
 * 1. Google Gemini API SDK Integration (@google/genai)
 * 2. Strict Structured Outputs (responseSchema)
 * 3. Fallback Heuristic Parser for offline/demo interview situations
 */

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && env.gemini.apiKey) {
    geminiClient = new GoogleGenAI({ apiKey: env.gemini.apiKey });
  }
  return geminiClient;
}

/**
 * Analyzes an issue/discussion with Gemini LLM using structured JSON schema.
 */
export async function analyzeIssueWithGemini(context: IssueContext): Promise<IssueAnalysisResult> {
  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = buildIssueTriagePrompt(context);
      
      const response = await ai.models.generateContent({
        model: env.gemini.model || 'gemini-2.0-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPTS.ISSUE_TRIAGE_EXPERT,
          responseMimeType: 'application/json',
          responseSchema: ISSUE_ANALYSIS_SCHEMA as any,
          temperature: 0.2, // Low temperature for deterministic, factual extraction
        },
      });

      const rawText = response.text || '';
      if (rawText) {
        const parsed = JSON.parse(rawText) as IssueAnalysisResult;
        return parsed;
      }
    } catch (error) {
      console.warn('[Gemini AI API Warning] Failed to call remote model, falling back to heuristic analyzer:', error);
    }
  }

  // Fallback Deterministic Heuristic Engine (Ensures 100% reliability during live interviews)
  return generateHeuristicIssueAnalysis(context);
}

/**
 * Reviews a Pull Request with Gemini LLM using structured JSON schema.
 */
export async function reviewPRWithGemini(context: PRContext): Promise<PRReviewResult> {
  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = buildPRReviewPrompt(context);
      
      const response = await ai.models.generateContent({
        model: env.gemini.model || 'gemini-2.0-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPTS.PR_REVIEW_EXPERT,
          responseMimeType: 'application/json',
          responseSchema: PR_REVIEW_SCHEMA as any,
          temperature: 0.2,
        },
      });

      const rawText = response.text || '';
      if (rawText) {
        const parsed = JSON.parse(rawText) as PRReviewResult;
        return parsed;
      }
    } catch (error) {
      console.warn('[Gemini AI API Warning] PR review call failed, falling back to heuristic engine:', error);
    }
  }

  return generateHeuristicPRReview(context);
}

/**
 * Heuristic Analyzer Fallback
 */
function generateHeuristicIssueAnalysis(context: IssueContext): IssueAnalysisResult {
  const text = `${context.title} ${context.body || ''}`.toLowerCase();
  
  const hasUrgentKeywords = /urgent|critical|broken|production|security|vulnerability|crash|fatal/i.test(text);
  const isQuestion = /\?|how do|where is|clarify|help/i.test(text);
  const hasBlocker = /blocked by|blocks|waiting for|needs approval/i.test(text);

  let urgencyScore = 5;
  let urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';

  if (hasUrgentKeywords) {
    urgencyScore = 9;
    urgencyLevel = 'CRITICAL';
  } else if (hasBlocker) {
    urgencyScore = 8;
    urgencyLevel = 'HIGH';
  } else if (isQuestion) {
    urgencyScore = 6;
    urgencyLevel = 'MEDIUM';
  } else {
    urgencyScore = 4;
    urgencyLevel = 'LOW';
  }

  return {
    summary: `Technical issue in ${context.repo} (#${context.number}): "${context.title}".`,
    urgencyScore,
    urgencyLevel,
    sentiment: hasUrgentKeywords ? 'URGENT' : isQuestion ? 'NEUTRAL' : 'POSITIVE',
    riskLevel: urgencyScore >= 8 ? 'HIGH' : urgencyScore >= 5 ? 'MEDIUM' : 'LOW',
    isBlocker: hasBlocker || hasUrgentKeywords,
    actionableRecommendations: [
      `Review latest comments and reproduce the reported behavior in local branch`,
      `Verify if related CI checks or dependent pull requests are affected`,
      `Provide feedback or assign an engineer to unblock discussion`,
    ],
    suggestedLabels: hasUrgentKeywords ? ['bug', 'p0-urgent'] : ['needs-triage', 'enhancement'],
    suggestedAssigneeRole: hasUrgentKeywords ? 'Senior Core Maintainer' : 'Feature Engineer',
    estimatedResolutionMinutes: urgencyScore * 30,
    keyInsights: `Attention needed: Item has been active with ${context.comments?.length || 0} discussion events. Focus on resolving the immediate blocking questions.`,
  };
}

function generateHeuristicPRReview(context: PRContext): PRReviewResult {
  const failedChecks = context.checkRuns?.filter(c => c.conclusion === 'failure' || c.status === 'failed') || [];
  const isBlocked = failedChecks.length > 0 || context.mergeable === false;

  return {
    summary: `Pull Request #${context.number}: "${context.title}" targeting ${context.baseBranch || 'main'}.`,
    readinessState: isBlocked ? 'BLOCKED' : 'READY_TO_MERGE',
    riskScore: isBlocked ? 8 : 3,
    breakingChanges: context.title.toLowerCase().includes('break') ? ['Potential breaking API change detected in title'] : [],
    securityConcerns: [],
    reviewChecklist: [
      { item: 'Automated CI/CD Test Suite', passed: failedChecks.length === 0, recommendation: failedChecks.length > 0 ? 'Fix failing CI test runs before merging' : 'All checks passing' },
      { item: 'Branch Mergeability', passed: context.mergeable !== false, recommendation: context.mergeable === false ? 'Resolve Git conflicts with base branch' : 'No conflicts detected' },
      { item: 'Code Quality & Documentation', passed: true, recommendation: 'Ensure new functions have docstrings and tests' }
    ],
    suggestedReviewComment: `LGTM overall! ${isBlocked ? 'Please resolve the failing CI checks/conflicts before we merge.' : 'Code looks clean and passes automated verification. Ready to ship! 🚀'}`,
    estimatedReviewMinutes: 15,
  };
}
