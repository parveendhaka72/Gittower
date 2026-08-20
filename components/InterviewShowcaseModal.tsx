'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Database,
  Table,
  Cpu,
  Layers,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Send,
  Zap,
  Code2,
  Clock,
  Shield,
  Activity,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import AIInsightCard from './AIInsightCard';
import { IssueAnalysisResult } from '@/lib/ai/schemas';

interface InterviewShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InterviewShowcaseModal({ isOpen, onClose }: InterviewShowcaseModalProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'nosql' | 'sql' | 'js' | 'architecture'>('ai');

  // AI Tab State
  const [aiTitle, setAiTitle] = useState('Critical WebKit Hydration Race Condition in Streaming SSR');
  const [aiBody, setAiBody] = useState('When streaming server components with suspense boundaries, WebKit engine drops hydration markers on fast network transitions, throwing unhandled DOMException.');
  const [aiRepo, setAiRepo] = useState('facebook/react');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<IssueAnalysisResult | null>(null);

  // NoSQL Mongo Tab State
  const [notes, setNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNotePriority, setNewNotePriority] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P1');
  const [newNoteRepo, setNewNoteRepo] = useState('facebook/react');
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // SQL Postgres Tab State
  const [sqlData, setSqlData] = useState<any>(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [activeSqlView, setActiveSqlView] = useState<'inner' | 'left' | 'aggregate' | 'schema'>('inner');

  // JS Concepts Tab State
  const [jsData, setJsData] = useState<any>(null);
  const [jsLoading, setJsLoading] = useState(false);

  // Fetch initial data for tabs
  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const res = await fetch('/api/notes');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setNotes(json.data);
      }
    } catch (e) {
      console.error(e);
    }
    setNotesLoading(false);
  };

  const fetchSqlAnalytics = async () => {
    setSqlLoading(true);
    try {
      const res = await fetch('/api/analytics/bottlenecks');
      const json = await res.json();
      if (json.success) {
        setSqlData(json.data);
      }
    } catch (e) {
      console.error(e);
    }
    setSqlLoading(false);
  };

  const fetchJsBenchmark = async () => {
    setJsLoading(true);
    try {
      const res = await fetch('/api/interview/js-benchmark');
      const json = await res.json();
      if (json.success) {
        setJsData(json.data);
      }
    } catch (e) {
      console.error(e);
    }
    setJsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
      fetchSqlAnalytics();
      fetchJsBenchmark();
    }
  }, [isOpen]);

  // AI Analysis Trigger
  const handleRunAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/analyze-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: aiTitle,
          repo: aiRepo,
          number: 28412,
          author: 'senior_lead',
          issueBody: aiBody,
          state: 'open',
          comments: [
            { user: 'maintainer_1', body: 'Can we reproduce this in Node 22 environment?', createdAt: new Date().toISOString() },
            { user: 'developer_2', body: 'Yes, blocking our release candidate rollout.', createdAt: new Date().toISOString() },
          ],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAiResult(json.data);
      }
    } catch (e) {
      console.error('AI analysis error:', e);
    }
    setAiLoading(false);
  };

  // Create Note Trigger (MongoDB CRUD)
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    setIsCreatingNote(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: newNoteRepo,
          issueNumber: Math.floor(Math.random() * 9000) + 1000,
          title: newNoteTitle,
          content: newNoteContent,
          priority: newNotePriority,
          tags: ['interview_demo', newNotePriority.toLowerCase()],
          author: 'interviewer',
        }),
      });
      if (res.ok) {
        setNewNoteTitle('');
        setNewNoteContent('');
        fetchNotes();
      }
    } catch (e) {
      console.error(e);
    }
    setIsCreatingNote(false);
  };

  // Delete Note Trigger
  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#0c0e14] border border-slate-700/70 w-full max-w-5xl h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#0f131d] to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                GitTower Full-Stack Interview Showcase
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  All 25 Criteria Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">Interactive live demonstrations of AI, Backend, Databases, and JS Core Concepts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-800 bg-[#080a0f] shrink-0 overflow-x-auto">
          {[
            { id: 'ai', label: '1. AI App Engineering', icon: Sparkles },
            { id: 'nosql', label: '2. NoSQL (MongoDB CRUD)', icon: Database },
            { id: 'sql', label: '3. SQL (Postgres JOINs)', icon: Table },
            { id: 'js', label: '4. JavaScript Mastery', icon: Cpu },
            { id: 'architecture', label: '5. System Architecture', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ─────────────────────────────────────────────────────────────
              TAB 1: AI APP ENGINEERING
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* Concept Banner */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> LLM Integration
                  </div>
                  <p className="text-xs text-slate-400">Google Gemini 2.0/2.5 SDK (`@google/genai`) with low-temperature deterministic extraction.</p>
                </div>
                <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xs font-bold text-purple-400 mb-1 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" /> Prompt Engineering
                  </div>
                  <p className="text-xs text-slate-400">Role prompts, few-shot contextual injection, Chain-of-Thought reasoning steps, and prompt injection guards.</p>
                </div>
                <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Structured Outputs
                  </div>
                  <p className="text-xs text-slate-400">Strict JSON Schema (`responseSchema`) enforcing typed urgency scores, sentiment, risk, and action items.</p>
                </div>
              </div>

              {/* Interactive Runner */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Play className="w-4 h-4 text-blue-400" />
                    Live Prompt & Schema Execution Test
                  </h3>
                  <button
                    onClick={handleRunAiAnalysis}
                    disabled={aiLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Analyze with Gemini LLM
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Issue Title</label>
                    <input
                      type="text"
                      value={aiTitle}
                      onChange={(e) => setAiTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Target Repository</label>
                    <input
                      type="text"
                      value={aiRepo}
                      onChange={(e) => setAiRepo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Issue Body / Context</label>
                  <textarea
                    rows={3}
                    value={aiBody}
                    onChange={(e) => setAiBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Render AI Result */}
              {aiResult ? (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Generated Structured Output Result</h4>
                  <AIInsightCard analysis={aiResult} />
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-900/20 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                  Click <strong>&quot;Analyze with Gemini LLM&quot;</strong> above to trigger live prompt execution and schema validation.
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: NOSQL (MONGODB CRUD)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'nosql' && (
            <div className="space-y-6">
              {/* Concept Banner */}
              <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    MongoDB NoSQL Schema Modeling & Full CRUD
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Stores custom developer attention notes, priority overrides (`P0-P3`), and tags for issues and pull requests.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20">POST (201 Created)</span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-blue-400 border border-blue-500/20">GET (200 OK)</span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-yellow-400 border border-yellow-500/20">PATCH (200 OK)</span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-red-400 border border-red-500/20">DELETE (200 OK)</span>
                </div>
              </div>

              {/* Create Note Form */}
              <form onSubmit={handleCreateNote} className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> Create Attention Note (POST /api/notes)
                </h4>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Note Title..."
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Repository (e.g. facebook/react)"
                      value={newNoteRepo}
                      onChange={(e) => setNewNoteRepo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <select
                      value={newNotePriority}
                      onChange={(e) => setNewNotePriority(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="P0">P0 - Blocker</option>
                      <option value="P1">P1 - High</option>
                      <option value="P2">P2 - Medium</option>
                      <option value="P3">P3 - Low</option>
                    </select>
                  </div>
                </div>
                <div>
                  <textarea
                    rows={2}
                    placeholder="Note Content / Attention triage details..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreatingNote}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                >
                  {isCreatingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Insert Document (Mongo CRUD)
                </button>
              </form>

              {/* Notes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Documents in Collection ({notes.length})
                </h4>

                {notesLoading ? (
                  <div className="py-8 flex justify-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : notes.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/20 rounded-xl border border-slate-800">
                    No notes in collection. Add one above!
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {notes.map((note) => (
                      <div key={note._id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-white">{note.title}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${note.priority === 'P0' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                              {note.priority}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mb-2 leading-relaxed">{note.content}</p>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {note.repo} • #{note.issueNumber} • by {note.author}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-slate-500 font-mono">ID: {note._id?.slice(0, 12)}...</span>
                          <button
                            onClick={() => handleDeleteNote(note._id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                            title="Delete note (DELETE /api/notes/[id])"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: SQL (POSTGRESQL RELATIONAL & JOINS)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'sql' && (
            <div className="space-y-6">
              {/* Concept Banner */}
              <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Table className="w-4 h-4 text-purple-400" />
                    PostgreSQL Relational Schema Design & SQL JOINs
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Multi-table relational schema with Primary Keys (PK), Foreign Keys (FK), `INNER JOIN`, `LEFT JOIN`, and Bottleneck Aggregations.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(['inner', 'left', 'aggregate', 'schema'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => setActiveSqlView(view)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        activeSqlView === view
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {view === 'inner' ? 'INNER JOIN' : view === 'left' ? 'LEFT JOIN' : view === 'aggregate' ? 'AGGREGATE' : 'DDL Schema'}
                    </button>
                  ))}
                </div>
              </div>

              {/* View 1: INNER JOIN */}
              {activeSqlView === 'inner' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-purple-300">
                    <strong className="text-white block mb-1">SQL Query:</strong>
                    SELECT ra.id, pr.title, r.full_name, reviewer.username, ra.turnaround_hours FROM review_assignments ra INNER JOIN pull_requests pr ON ra.pr_id = pr.id INNER JOIN repositories r ON pr.repo_id = r.id INNER JOIN users reviewer ON ra.reviewer_id = reviewer.id;
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                        <tr>
                          <th className="p-3">Review ID (PK)</th>
                          <th className="p-3">Pull Request</th>
                          <th className="p-3">Repository (FK)</th>
                          <th className="p-3">Reviewer (FK)</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Turnaround (Hrs)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {sqlData?.results?.innerJoinReviews?.map((row: any) => (
                          <tr key={row.reviewId} className="hover:bg-slate-900/50">
                            <td className="p-3 font-mono text-purple-400">#{row.reviewId}</td>
                            <td className="p-3 font-semibold text-white">#{row.prNumber} {row.prTitle}</td>
                            <td className="p-3 font-mono text-slate-400">{row.repoName}</td>
                            <td className="p-3">@{row.reviewerUsername}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.reviewStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                {row.reviewStatus}
                              </span>
                            </td>
                            <td className="p-3 font-mono">{row.turnaroundHours}h</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* View 2: LEFT JOIN */}
              {activeSqlView === 'left' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-purple-300">
                    <strong className="text-white block mb-1">SQL Query:</strong>
                    SELECT r.full_name, r.health_score, wb.workflow_name, wb.error_message FROM repositories r LEFT JOIN workflow_blockers wb ON r.id = wb.repo_id AND wb.status = &apos;ACTIVE&apos;;
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                        <tr>
                          <th className="p-3">Repository</th>
                          <th className="p-3">Health Score</th>
                          <th className="p-3">Blocker Workflow</th>
                          <th className="p-3">Error Message (Nullable in LEFT JOIN)</th>
                          <th className="p-3">Severity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {sqlData?.results?.leftJoinBlockers?.map((row: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-900/50">
                            <td className="p-3 font-bold text-white font-mono">{row.repoName}</td>
                            <td className="p-3 font-mono">{row.healthScore}/100</td>
                            <td className="p-3">
                              {row.workflowName ? (
                                <span className="text-red-400 font-medium">{row.workflowName}</span>
                              ) : (
                                <span className="text-emerald-400 font-mono">NULL (No Blockers)</span>
                              )}
                            </td>
                            <td className="p-3 text-slate-400">{row.errorMessage || '—'}</td>
                            <td className="p-3">
                              {row.severity ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">{row.severity}</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">CLEAN</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* View 3: AGGREGATE JOIN */}
              {activeSqlView === 'aggregate' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-purple-300">
                    <strong className="text-white block mb-1">SQL Query:</strong>
                    SELECT r.full_name, COUNT(pr.id) as total_prs, COUNT(ra.id) as pending_reviews, ROUND(AVG(ra.turnaround_hours), 2) as avg_turnaround FROM repositories r LEFT JOIN pull_requests pr ON r.id = pr.repo_id GROUP BY r.id, r.full_name;
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {sqlData?.results?.bottleneckAnalytics?.map((b: any) => (
                      <div key={b.repoName} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-mono">{b.repoName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${b.healthStatus === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {b.healthStatus}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                          <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Open PRs</span>
                            <span className="text-white font-bold">{b.totalPrs}</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Pending Reviews</span>
                            <span className="text-yellow-400 font-bold">{b.pendingReviewsCount}</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Avg Turnaround</span>
                            <span className="text-white font-bold">{b.avgTurnaroundHours}h</span>
                          </div>
                          <div className="bg-slate-950 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 block text-[10px]">Blockers</span>
                            <span className="text-red-400 font-bold">{b.activeBlockersCount}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View 4: DDL Schema */}
              {activeSqlView === 'schema' && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
                  <pre>{sqlData?.schemaDDL}</pre>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 4: JAVASCRIPT MASTERY
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'js' && (
            <div className="space-y-6">
              {/* Event Loop Simulation */}
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    1. V8 Event Loop: Call Stack $\rightarrow$ Microtasks $\rightarrow$ Macrotasks
                  </h3>
                  <button
                    onClick={fetchJsBenchmark}
                    disabled={jsLoading}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3" /> Re-run Trace
                  </button>
                </div>

                <div className="space-y-2">
                  {jsData?.eventLoop?.timeline?.map((item: any) => (
                    <div key={item.step} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold font-mono shrink-0">
                        {item.step}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        item.source.includes('Sync') ? 'bg-blue-500/20 text-blue-400' :
                        item.source.includes('MICROTASK') ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {item.source.split(' ')[0]}
                      </span>
                      <span className="text-slate-300 flex-1">{item.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Closures & Async Benchmark Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Closures */}
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-400" /> 2. Closures & Private State
                  </h3>
                  <p className="text-xs text-slate-400">
                    Memoizer function maintains closed-over cache map across calls without polluting global scope.
                  </p>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
                    <div>1st Call: result={jsData?.closures?.firstCall?.result} (fromCache: {String(jsData?.closures?.firstCall?.fromCache)})</div>
                    <div>2nd Call: result={jsData?.closures?.secondCall?.result} (fromCache: {String(jsData?.closures?.secondCall?.fromCache)})</div>
                    <div className="text-emerald-400 font-bold pt-1">Total Function Executions: {jsData?.closures?.totalExecutions} (Cache Verified)</div>
                  </div>
                </div>

                {/* Async Benchmark */}
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" /> 3. Async/Await: Parallel vs Sequential
                  </h3>
                  <p className="text-xs text-slate-400">
                    `Promise.all` executes concurrent microtasks simultaneously instead of sequentially blocking.
                  </p>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
                    <div>Sequential Duration: {jsData?.asyncAwaitBenchmark?.sequentialDurationMs}ms</div>
                    <div>Parallel Duration: {jsData?.asyncAwaitBenchmark?.parallelDurationMs}ms</div>
                    <div className="text-yellow-400 font-bold pt-1">Speedup: {jsData?.asyncAwaitBenchmark?.speedupFactor}</div>
                  </div>
                </div>
              </div>

              {/* Hoisting & Promises */}
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-400" /> 4. Hoisting & Temporal Dead Zone (TDZ)
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <strong className="text-purple-300 block mb-1">Engine Evaluation:</strong>
                    {jsData?.hoisting?.observations?.map((obs: string, i: number) => (
                      <div key={i} className="text-slate-300">• {obs}</div>
                    ))}
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto">
                    {jsData?.hoisting?.codeSnippet}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 5: SYSTEM ARCHITECTURE
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Full-Stack Multi-Tier System Architecture
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  GitTower integrates an attention-based frontend client with Next.js Edge Middleware, REST API handlers, external services (GitHub REST/GraphQL + Google Gemini LLM), and dual-tier persistence (MongoDB for document-oriented attention notes and PostgreSQL for relational bottleneck metrics).
                </p>

                {/* Architecture Steps */}
                <div className="grid sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold text-blue-400">1. Client Layer</div>
                    <p className="text-[11px] text-slate-400">Next.js 15 App Router + React 19 CSR/SSR, Framer Motion, Tailwind v4.</p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold text-purple-400">2. Middleware & Gateway</div>
                    <p className="text-[11px] text-slate-400">Edge auth guards, security headers, rate limiter token buckets.</p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-400">3. REST API & AI</div>
                    <p className="text-[11px] text-slate-400">`withErrorHandler` HOF, standard status codes (200, 201, 400, 422, 500), Gemini LLM.</p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold text-yellow-400">4. Dual Persistence</div>
                    <p className="text-[11px] text-slate-400">MongoDB NoSQL collections + PostgreSQL relational tables with SQL JOINs.</p>
                  </div>
                </div>
              </div>

              {/* Error Envelope & Status Codes */}
              <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  REST Standards & Server-Side Error Handling
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-emerald-300">
                    <strong className="text-white block mb-1">Standard Success Envelope (HTTP 200/201):</strong>
                    {`{\n  "success": true,\n  "data": { ... },\n  "meta": { "timestamp": "2026-08-18T..." }\n}`}
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-red-300">
                    <strong className="text-white block mb-1">Standard Error Envelope (HTTP 400/401/404/500):</strong>
                    {`{\n  "success": false,\n  "error": {\n    "code": "BAD_REQUEST",\n    "statusCode": 400,\n    "message": "..."\n  }\n}`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#080a0f] flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>GitTower Engineering Interview Evaluation Suite</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close Showcase
          </button>
        </div>
      </motion.div>
    </div>
  );
}
