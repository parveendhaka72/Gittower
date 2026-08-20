/**
 * Structured Output Schema Definitions for Gemini LLM
 * Enforces deterministic JSON outputs for AI App Engineering.
 */

export interface IssueAnalysisResult {
  summary: string;
  urgencyScore: number; // 1 to 10
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'URGENT' | 'FRUSTRATED' | 'NEUTRAL' | 'POSITIVE';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  isBlocker: boolean;
  actionableRecommendations: string[];
  suggestedLabels: string[];
  suggestedAssigneeRole: string;
  estimatedResolutionMinutes: number;
  keyInsights: string;
}

export interface PRReviewResult {
  summary: string;
  readinessState: 'READY_TO_MERGE' | 'NEEDS_CHANGES' | 'NEEDS_REVIEW' | 'BLOCKED';
  riskScore: number; // 1 to 10
  breakingChanges: string[];
  securityConcerns: string[];
  reviewChecklist: {
    item: string;
    passed: boolean;
    recommendation: string;
  }[];
  suggestedReviewComment: string;
  estimatedReviewMinutes: number;
}

/**
 * JSON Schema specification compatible with Gemini @google/genai responseSchema
 */
export const ISSUE_ANALYSIS_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "STRING",
      description: "Concise 1-2 sentence executive summary of the issue or discussion.",
    },
    urgencyScore: {
      type: "INTEGER",
      description: "Priority score from 1 (lowest priority) to 10 (immediate production critical blocker).",
    },
    urgencyLevel: {
      type: "STRING",
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      description: "Categorical urgency bucket.",
    },
    sentiment: {
      type: "STRING",
      enum: ["URGENT", "FRUSTRATED", "NEUTRAL", "POSITIVE"],
      description: "Emotional tone detected from author and participants.",
    },
    riskLevel: {
      type: "STRING",
      enum: ["LOW", "MEDIUM", "HIGH"],
      description: "Technical risk level associated with this issue.",
    },
    isBlocker: {
      type: "BOOLEAN",
      description: "True if this issue blocks a release, CI pipeline, or developer workflow.",
    },
    actionableRecommendations: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Concrete next steps the developer should take immediately.",
    },
    suggestedLabels: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Recommended GitHub labels to categorize this issue (e.g. bug, p0, needs-repro).",
    },
    suggestedAssigneeRole: {
      type: "STRING",
      description: "Recommended developer role (e.g., Frontend Specialist, Security Lead, DevOps).",
    },
    estimatedResolutionMinutes: {
      type: "INTEGER",
      description: "Rough estimate of engineering time required in minutes.",
    },
    keyInsights: {
      type: "STRING",
      description: "Deep architectural or context-aware insight explaining why this needs attention.",
    },
  },
  required: [
    "summary",
    "urgencyScore",
    "urgencyLevel",
    "sentiment",
    "riskLevel",
    "isBlocker",
    "actionableRecommendations",
    "suggestedLabels",
    "keyInsights",
  ],
};

export const PR_REVIEW_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "STRING",
      description: "Clear technical summary of the pull request purpose and implementation.",
    },
    readinessState: {
      type: "STRING",
      enum: ["READY_TO_MERGE", "NEEDS_CHANGES", "NEEDS_REVIEW", "BLOCKED"],
      description: "Merge readiness assessment.",
    },
    riskScore: {
      type: "INTEGER",
      description: "Risk score from 1 to 10 based on diff scope, CI checks, and architectural impact.",
    },
    breakingChanges: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List of breaking API, schema, or runtime changes detected.",
    },
    securityConcerns: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Potential security vulnerabilities, exposed secrets, or unsafe patterns.",
    },
    reviewChecklist: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          item: { type: "STRING" },
          passed: { type: "BOOLEAN" },
          recommendation: { type: "STRING" },
        },
        required: ["item", "passed", "recommendation"],
      },
      description: "Checklist evaluating tests, documentation, types, and error handling.",
    },
    suggestedReviewComment: {
      type: "STRING",
      description: "Professional, constructive markdown comment ready to post on the PR review.",
    },
    estimatedReviewMinutes: {
      type: "INTEGER",
      description: "Estimated time in minutes to thoroughly review the code.",
    },
  },
  required: [
    "summary",
    "readinessState",
    "riskScore",
    "breakingChanges",
    "securityConcerns",
    "reviewChecklist",
    "suggestedReviewComment",
  ],
};
