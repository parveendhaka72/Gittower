'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, AlertTriangle, CheckCircle2, Clock, Tag, UserCheck, ShieldAlert, Zap, Flame } from 'lucide-react';
import { IssueAnalysisResult } from '@/lib/ai/schemas';

/**
 * Composable AI Insight Card
 * Demonstrates:
 * - React Component Composition (slots, sub-elements)
 * - Structured Output visualization
 * - Clean visual hierarchy & dark mode styling
 */
interface AIInsightCardProps {
  analysis: IssueAnalysisResult;
  onApplyLabel?: (label: string) => void;
  isLoading?: boolean;
}

export default function AIInsightCard({ analysis, onApplyLabel, isLoading }: AIInsightCardProps) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-950/20 to-purple-950/20 border border-blue-500/30 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-blue-400 animate-spin" />
          <div className="h-4 bg-blue-500/20 rounded w-48" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-800 rounded w-3/4" />
        </div>
      </div>
    );
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'URGENT': return { label: '🔥 Urgent Tone', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
      case 'FRUSTRATED': return { label: '⚠️ Blocked / Frustrated', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      case 'POSITIVE': return { label: '✨ Positive', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      default: return { label: '💬 Neutral Inquirer', color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  const sentiment = getSentimentBadge(analysis.sentiment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#0e1626] via-[#10141f] to-[#12111d] border border-blue-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              Gemini AI Attention Intelligence
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Structured Output
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Urgency Badge */}
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getUrgencyColor(analysis.urgencyLevel)}`}>
            <Zap className="w-3.5 h-3.5" />
            Urgency {analysis.urgencyScore}/10 ({analysis.urgencyLevel})
          </span>
          {/* Sentiment Badge */}
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${sentiment.color}`}>
            {sentiment.label}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4">
        <p className="text-sm text-slate-300 leading-relaxed font-normal">
          {analysis.summary}
        </p>
      </div>

      {/* Key Insight Callout */}
      {analysis.keyInsights && (
        <div className="mt-3.5 p-3 rounded-xl bg-blue-950/30 border border-blue-800/30 text-xs text-blue-200 flex items-start gap-2.5">
          <Flame className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-300">Why this matters: </span>
            {analysis.keyInsights}
          </div>
        </div>
      )}

      {/* Actionable Recommendations List */}
      <div className="mt-5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Actionable Next Steps
        </h4>
        <div className="space-y-2">
          {analysis.actionableRecommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                {i + 1}
              </span>
              <span className="leading-relaxed flex-1">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Metadata */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5" title="Estimated resolution time">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>~{analysis.estimatedResolutionMinutes} mins est. effort</span>
          </div>
          <div className="flex items-center gap-1.5" title="Recommended role">
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Assignee: <strong className="text-slate-300 font-medium">{analysis.suggestedAssigneeRole}</strong></span>
          </div>
        </div>

        {/* Suggested Labels */}
        {analysis.suggestedLabels.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex flex-wrap gap-1">
              {analysis.suggestedLabels.map((l) => (
                <span
                  key={l}
                  onClick={() => onApplyLabel?.(l)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono cursor-pointer transition-colors"
                >
                  +{l}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
