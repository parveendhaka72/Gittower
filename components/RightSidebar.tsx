'use client';

import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, X, CheckCircle2, AlertOctagon, Timer, Activity, ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRealTime } from '../hooks/useRealtime';

export type ActiveWorkItem = {
  id: string;
  repo: string;
  avatar: string;
  name: string;
  status: string;
  progress?: string;
  time?: string;
  eta?: string;
  icon: 'yellow-dot' | 'red-dot' | 'green-dot';
  action?: string;
  url?: string;
};

export type BlockerItem = {
  id: string;
  title: string;
  reason: string;
  color: string;
  url?: string;
};

export type WaitingOnItem = {
  id: string;
  title: string;
  reason: string;
  url?: string;
};

export type TimelineEvent = {
  id: string;
  time: string;
  text: string;
  active?: boolean;
  isError?: boolean;
};

export interface RightSidebarProps {
  initialActiveWork?: ActiveWorkItem[];
  initialBlockers?: BlockerItem[];
  initialWaitingOn?: WaitingOnItem[];
  initialTimeline?: TimelineEvent[];
}

export default function RightSidebar({
  initialActiveWork = [],
  initialBlockers = [],
  initialWaitingOn = [],
  initialTimeline = []
}: RightSidebarProps) {
  const [activeWork, setActiveWork] = useState(initialActiveWork);
  const [blockers, setBlockers] = useState(initialBlockers);
  const [waitingOn, setWaitingOn] = useState(initialWaitingOn);
  const [timeline, setTimeline] = useState(initialTimeline);

  // Sync state if props change
  useEffect(() => {
    setActiveWork(initialActiveWork);
    setBlockers(initialBlockers);
    setWaitingOn(initialWaitingOn);
    setTimeline(initialTimeline);
  }, [initialActiveWork, initialBlockers, initialWaitingOn, initialTimeline]);

  const totalItems = activeWork.length + blockers.length + waitingOn.length + timeline.length;

  const removeWork = (id: string) => setActiveWork(activeWork.filter(w => w.id !== id));
  const removeBlocker = (id: string) => setBlockers(blockers.filter(b => b.id !== id));
  const removeWaiting = (id: string) => setWaitingOn(waitingOn.filter(w => w.id !== id));
  const removeTimeline = (id: string) => setTimeline(timeline.filter(t => t.id !== id));

  const { isConnected, events, triggerTestEvent } = useRealTime();

  return (
    <aside className="hidden 2xl:flex flex-col w-[360px] bg-app-base border border-app-border rounded-2xl m-4 h-[calc(100vh-32px)] shrink-0 overflow-y-auto shadow-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="p-5 border-b border-app-border/50 bg-gradient-to-b from-app-base to-app-base/50 sticky top-0 z-20 backdrop-blur-md rounded-t-2xl flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-wider text-app-muted uppercase">Live Activity Center</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[11px] font-mono text-slate-400">
              {isConnected ? 'Real-Time SSE Sync Active' : 'Connecting Real-Time...'}
            </span>
          </div>
        </div>
        <button
          onClick={() => triggerTestEvent('PR_REVIEW_REQUESTED', 'Urgent review requested on PR #42')}
          className="text-[10px] px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-md transition-colors"
          title="Emit Test Real-Time Event"
        >
          + Emit Event
        </button>
      </div>

      {totalItems === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-12 h-12 bg-app-panel rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-app-muted" />
          </div>
          <h3 className="text-app-text font-medium mb-1">Nothing Active</h3>
          <p className="text-app-muted text-sm">No workflows, deployments, or reviews are currently in progress. You're all caught up.</p>
        </div>
      ) : (
        <div className="p-4 space-y-8 pb-10">
          
          {/* Active Work */}
          {activeWork.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 px-1 text-app-text font-medium">
                <Zap className="w-4 h-4 text-yellow-500" />
                <h3>Active Work</h3>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {activeWork.map(work => (
                    <motion.div 
                      layout
                      key={work.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0, transition: { duration: 0.2 } }}
                      className="group relative bg-app-panel rounded-xl border border-app-border p-4 shadow-sm hover:border-app-border/80 transition-all overflow-hidden"
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {work.url && (
                          <a 
                            href={work.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-app-muted hover:text-white p-1"
                            title="Open in GitHub"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button 
                          onClick={() => removeWork(work.id)}
                          className="text-app-muted hover:text-white p-1"
                          title="Mark as done"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-start gap-3">
                        <Image src={work.avatar || "https://github.com/github.png"} alt="Repo" width={20} height={20} className="rounded-sm mt-0.5 opacity-80" unoptimized />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {work.icon === 'yellow-dot' && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)] shrink-0" />}
                            {work.icon === 'red-dot' && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                            {work.icon === 'green-dot' && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                            <span className="font-semibold text-app-text text-sm truncate">{work.name}</span>
                          </div>
                          <div className="text-xs text-app-meta mb-2">{work.repo}</div>
                          
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className={work.icon === 'red-dot' ? 'text-red-400' : work.icon === 'green-dot' ? 'text-emerald-400' : 'text-app-muted'}>
                              {work.status}
                            </span>
                            {work.time && <span className="text-app-meta">{work.time}</span>}
                          </div>

                          {work.progress && (
                            <div className="space-y-1.5 mt-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-app-muted">{work.progress}</span>
                                <span className="text-app-meta">{work.eta}</span>
                              </div>
                              <div className="h-1 bg-app-base rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500/80 rounded-full w-[68%]" />
                              </div>
                            </div>
                          )}

                          {work.action && (
                            <a href="#" className="inline-block mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium">
                              {work.action}
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* Blockers */}
          {blockers.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 px-1 text-app-text font-medium">
                <AlertOctagon className="w-4 h-4 text-red-500" />
                <h3>Blockers</h3>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {blockers.map(blocker => (
                    <motion.div
                      layout
                      key={blocker.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden', transition: { duration: 0.2 } }}
                    >
                      <div className="group relative bg-app-panel/50 rounded-lg border border-app-border/60 p-3 hover:bg-app-panel transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${blocker.color}`} />
                          <div>
                            <div className="text-sm font-medium text-gray-200">{blocker.title}</div>
                            <div className="text-xs text-app-meta">{blocker.reason}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {blocker.url && (
                            <a 
                              href={blocker.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-app-muted hover:text-white p-1"
                              title="Open in GitHub"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button 
                            onClick={() => removeBlocker(blocker.id)}
                            className="text-app-muted hover:text-white p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* Waiting On */}
          {waitingOn.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 px-1 text-app-text font-medium">
                <Timer className="w-4 h-4 text-blue-400" />
                <h3>Waiting On</h3>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {waitingOn.map(item => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden', transition: { duration: 0.2 } }}
                    >
                      <div className="group relative bg-app-base rounded-lg border border-app-border/40 p-3 flex items-center justify-between hover:bg-app-panel/30 transition-colors">
                         <div>
                            <div className="text-sm font-medium text-gray-300">{item.title}</div>
                            <div className="text-xs text-app-meta">{item.reason}</div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.url && (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-app-muted hover:text-white p-1"
                                title="Open in GitHub"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button 
                              onClick={() => removeWaiting(item.id)}
                              className="text-app-muted hover:text-white p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 px-1 text-app-text font-medium">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3>Timeline</h3>
              </div>
              <div className="relative pl-[11px] space-y-4 before:absolute before:inset-y-2 before:left-[14.5px] before:w-px before:bg-app-border">
                <AnimatePresence>
                  {timeline.map((event) => (
                    <motion.div
                      layout
                      key={event.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden', transition: { duration: 0.2 } }}
                    >
                      <div className="relative flex items-center gap-4 group hover:bg-app-panel/30 -ml-2 p-2 rounded-lg transition-colors">
                        <div className={`w-2 h-2 rounded-full z-10 shrink-0 ${event.active ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]' : event.isError ? 'bg-red-400' : 'bg-app-muted'}`} />
                        <div className="flex-1 flex justify-between items-center text-sm min-w-0">
                          <span className={`${event.active ? 'text-emerald-400 font-medium' : event.isError ? 'text-red-400' : 'text-gray-300'} truncate mr-2`}>{event.text}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-app-meta text-xs">{event.time}</span>
                            <button 
                              onClick={() => removeTimeline(event.id)}
                              className="text-app-meta hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

        </div>
      )}
    </aside>
  );
}
