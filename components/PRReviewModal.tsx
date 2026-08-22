'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, CheckCircle, AlertTriangle, MessageSquare, Sparkles, 
  Loader2, ShieldCheck, CheckSquare, Send, GitPullRequest 
} from 'lucide-react';
import { PRReviewResult } from '@/lib/ai/schemas';

export interface PRReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pr: {
    number: number;
    title: string;
    repo: string;
    author: string;
    body?: string;
    headBranch?: string;
    baseBranch?: string;
    html_url?: string;
  } | null;
  onReviewSubmitted?: (reviewEvent: string, comment: string) => void;
}

export function PRReviewModal({ isOpen, onClose, pr, onReviewSubmitted }: PRReviewModalProps) {
  const [reviewType, setReviewType] = useState<'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'>('COMMENT');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReview, setAiReview] = useState<PRReviewResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !pr) return null;

  const handleGenerateAIReview = async () => {
    setIsGeneratingAI(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/ai/pr-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pr.title,
          repo: pr.repo,
          number: pr.number,
          author: pr.author,
          prBody: pr.body || '',
          headBranch: pr.headBranch,
          baseBranch: pr.baseBranch,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data as PRReviewResult;
        setAiReview(data);
        if (data.suggestedReviewComment && !comment) {
          setComment(data.suggestedReviewComment);
        }
        if (data.readinessState === 'READY_TO_MERGE') setReviewType('APPROVE');
        else if (data.readinessState === 'NEEDS_CHANGES') setReviewType('REQUEST_CHANGES');
      } else {
        setStatusMessage({ type: 'error', text: json.error?.message || 'Failed to generate AI review' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error generating AI review' });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim() && reviewType !== 'APPROVE') {
      setStatusMessage({ type: 'error', text: 'Please enter a review comment before submitting.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/github/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SUBMIT_REVIEW',
          repo: pr.repo,
          issueNumber: pr.number,
          event: reviewType,
          body: comment || (reviewType === 'APPROVE' ? 'Approved with GitTower Review' : 'Review feedback submitted via GitTower'),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: `Successfully submitted ${reviewType} review on GitHub!` });
        
        // Trigger real-time SSE broadcast
        fetch('/api/realtime/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'PR_REVIEW_REQUESTED',
            repo: pr.repo,
            title: `Review (${reviewType}) submitted for PR #${pr.number}`,
            itemNumber: pr.number,
            author: pr.author,
            urgency: reviewType === 'REQUEST_CHANGES' ? 'P0' : 'P2',
          }),
        }).catch(() => {});

        if (onReviewSubmitted) {
          onReviewSubmitted(reviewType, comment);
        }

        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to submit review' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error submitting review' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] bg-[#0c1017] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">
                  #{pr.number}
                </span>
                <span className="text-xs text-slate-400 font-mono">{pr.repo}</span>
              </div>
              <h2 className="text-base font-semibold text-white mt-0.5 line-clamp-1">{pr.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-sm">
          {/* AI Code Review Bar */}
          <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900/50 border border-blue-900/40 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Gemini 2.0 AI Pull Request Reviewer
                </span>
              </div>
              <button
                onClick={handleGenerateAIReview}
                disabled={isGeneratingAI}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing Diff & Tests...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate AI Review
                  </>
                )}
              </button>
            </div>

            {aiReview && (
              <div className="space-y-3 pt-2 text-xs border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Readiness State:</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                    aiReview.readinessState === 'READY_TO_MERGE'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : aiReview.readinessState === 'NEEDS_CHANGES'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {aiReview.readinessState} (Risk Score: {aiReview.riskScore}/10)
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  {aiReview.summary}
                </p>
                {aiReview.reviewChecklist && aiReview.reviewChecklist.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-semibold text-slate-300">Automated Review Checklist:</span>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {aiReview.reviewChecklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-300 bg-slate-900/80 p-2 rounded-md border border-slate-800">
                          {item.passed ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                          <span className="truncate">{item.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Review Decision Radios */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Review Decision
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setReviewType('APPROVE')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  reviewType === 'APPROVE'
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 shadow-sm ring-1 ring-emerald-500/50'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Approve
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">Submit approving review and allow merging</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewType('REQUEST_CHANGES')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  reviewType === 'REQUEST_CHANGES'
                    ? 'border-red-500 bg-red-900/30 text-red-300 shadow-sm ring-1 ring-red-500/50'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Request Changes
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">Submit feedback requiring resolution</span>
              </button>

              <button
                type="button"
                onClick={() => setReviewType('COMMENT')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  reviewType === 'COMMENT'
                    ? 'border-blue-500 bg-blue-950/30 text-blue-300 shadow-sm ring-1 ring-blue-500/50'
                    : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Comment
                </div>
                <span className="text-[11px] text-slate-400 leading-tight">Submit feedback without explicit approval</span>
              </button>
            </div>
          </div>

          {/* Comment Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Review Summary & Comments
              </label>
              {aiReview?.suggestedReviewComment && (
                <button
                  type="button"
                  onClick={() => setComment(aiReview.suggestedReviewComment)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Paste AI Suggestion
                </button>
              )}
            </div>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave your code review feedback, approval rationale, or change requirements..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                  : 'bg-red-950/50 border-red-800 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#080a0f] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitReview}
            disabled={isSubmitting}
            className={`px-5 py-2 rounded-xl font-semibold flex items-center gap-2 text-white transition-all shadow-md ${
              reviewType === 'APPROVE'
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : reviewType === 'REQUEST_CHANGES'
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-blue-600 hover:bg-blue-500'
            } disabled:opacity-50`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Review...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit {reviewType === 'APPROVE' ? 'Approval' : reviewType === 'REQUEST_CHANGES' ? 'Changes Request' : 'Review Comment'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
