'use client';

import { useEffect, useState, useRef } from 'react';
import WorkTree from '../components/WorkTree';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Loader2, GitPullRequest, AtSign, MessageCircle, GitMerge, CheckCircle2, AlertCircle, ExternalLink, LogOut, Inbox, Settings, Check, X, ShieldAlert, Clock, Ban, Network, Search, FolderTree, Menu, CircleDot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LandingPage from '../components/LandingPage';
import RightSidebar from '../components/RightSidebar';
import InterviewShowcaseModal from '../components/InterviewShowcaseModal';
import { PRReviewModal } from '../components/PRReviewModal';
import AIInsightCard from '../components/AIInsightCard';
import rehypeRaw from 'rehype-raw';
import remarkAlert from 'remark-github-alerts';
import { ArrowLeft, Send, AtSign as AtSignIcon, Hash, HelpCircle, CheckSquare, GitCommit, MoreHorizontal, UserPlus, UserMinus, Link2, PlayCircle, GitPullRequestDraft, ClipboardList, Bold, Italic, ChevronDown, Code2, Monitor, Box, AlertTriangle, AlertOctagon, Tag, Sparkles, Terminal } from 'lucide-react';
type User = {
  login: string;
  avatar_url: string;
  name: string;
};

const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
  const div = document.createElement('div');
  const style = window.getComputedStyle(element);
  
  ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'textTransform', 'wordSpacing', 'textIndent', 'lineHeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'boxSizing', 'width', 'height'].forEach(prop => {
    (div.style as any)[prop] = style.getPropertyValue(prop);
  });
  
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';
  div.style.overflow = 'hidden';
  
  div.textContent = element.value.substring(0, position);
  
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  
  document.body.appendChild(div);
  const coordinates = {
    top: span.offsetTop - element.scrollTop,
    left: span.offsetLeft - element.scrollLeft,
  };
  document.body.removeChild(div);
  return coordinates;
};

const processMarkdownMentions = (text: string | undefined | null) => {
  if (!text) return "";
  const tokens = text.split(/(```[\s\S]*?```|`[^`]+`)/);
  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0) {
      tokens[i] = tokens[i]
        .replace(/(^|\s)@([a-zA-Z0-9-]+)(?=\b|$)/g, '$1[@$2](mention://$2)')
        .replace(/(^|\s)#(\d+)(?=\b|$)/g, '$1[#$2](issue://$2)');
    }
  }
  return tokens.join('');
};

const createMarkdownLinkRenderer = (handleRelatedIssueClick: (num: string | number, baseUrl: string) => void, baseRepoUrl?: string) => function MarkdownLink(props: any) {
  const { href, children, ...rest } = props;
  
  if (href?.startsWith('mention://')) {
    const username = href.replace('mention://', '');
    return (
      <span className="group relative inline-block">
        <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer" className="text-blue-400 font-medium bg-blue-500/10 px-1 py-0.5 rounded hover:bg-blue-500/20 transition-colors">@{username}</a>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
          <div className="bg-app-panel border border-app-border rounded-lg p-3 shadow-xl w-48 pointer-events-none">
             <div className="flex items-center gap-3">
               <img src={`https://github.com/${username}.png?size=40`} className="w-10 h-10 rounded-full" />
               <div className="min-w-0">
                 <div className="font-bold text-white text-sm truncate">{username}</div>
                 <div className="text-xs text-app-meta">GitHub User</div>
               </div>
             </div>
          </div>
        </div>
      </span>
    );
  }
  
  if (href?.startsWith('issue://')) {
    const num = href.replace('issue://', '');
    return (
      <span className="group relative inline-block">
        <a 
           href={`#`} 
           onClick={(e) => { 
             e.preventDefault(); 
             if (baseRepoUrl) {
               handleRelatedIssueClick(num, baseRepoUrl);
             }
           }}
           className="text-emerald-400 font-medium bg-emerald-500/10 px-1 py-0.5 rounded hover:bg-emerald-500/20 transition-colors">#{num}</a>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
          <div className="bg-app-panel border border-app-border rounded-lg p-2 shadow-xl whitespace-nowrap text-sm text-app-text">
             Click to view #{num}
          </div>
        </div>
      </span>
    );
  }

  if (href && href.includes('github.com')) {
    const issueMatch = href.match(/github\.com\/([^\/]+)\/([^\/]+)\/(issues|pull)\/(\d+)/);
    if (issueMatch) {
      const [, owner, repo, type, num] = issueMatch;
      const fullRepo = `${owner}/${repo}`;
      return (
        <a
          {...rest}
          href={href}
          onClick={(e) => {
            e.preventDefault();
            handleRelatedIssueClick(num, `https://api.github.com/repos/${fullRepo}`);
          }}
          className="text-blue-500 hover:underline cursor-pointer"
        >
          {children}
        </a>
      );
    }
  }
  return <a {...props} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" />;
};

type GitHubIssue = {
  id: number;
  html_url: string;
  title: string;
  number: number;
  state: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  draft?: boolean;
  pull_request?: any;
  repository_url: string;
  assignees?: { login: string; avatar_url: string; }[];
  labels?: { name: string; color: string; }[];
  requested_reviewers?: { login: string; avatar_url: string; }[];
  related_issue?: {
    number: number;
    title: string;
    html_url: string;
  };
  body?: string;
  body_html?: string;
  comments_list?: {
    id: number;
    user: { login: string; avatar_url: string };
    created_at: string;
    body: string;
    body_html?: string;
  }[];
  isRead?: boolean;
  author_association?: string;
};

type DashboardData = {
  reviewRequested: GitHubIssue[];
  mentions: GitHubIssue[];
  myPrs: GitHubIssue[];
  myIssues: GitHubIssue[];
  involved: GitHubIssue[];
  assigned: GitHubIssue[];
  notifications: GitHubIssue[];
};

const extractCamoUrls = (html?: string) => {
  const map = new Map<string, string>();
  if (!html) return map;
  const imgRegex = /<img\s+([^>]+)>/g;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const attrs = match[1];
    const srcMatch = attrs.match(/src="([^"]+)"/);
    const canonicalMatch = attrs.match(/data-canonical-src="([^"]+)"/);
    if (srcMatch && canonicalMatch) {
      map.set(canonicalMatch[1], srcMatch[1]);
    }
  }
  return map;
};

const TimelineComment = ({ event, handleRelatedIssueClick, baseRepoUrl }: any) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isLong = event.body && event.body.length > 300;

  return (
    <div className="relative z-10 flex gap-4">
      <div className="shrink-0 mt-1">
        <Image src={event.user.avatar_url} alt={event.user.login} width={40} height={40} className="rounded-full ring-4 ring-app-base" />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center gap-3 mb-1 justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-app-text">{event.user.login}</span>
            <span className="text-app-meta text-sm">{formatDistanceToNow(new Date(event.created_at || event.updated_at), { addSuffix: true })}</span>
          </div>
          {isLong && (
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-xs text-blue-500 hover:underline px-2 py-0.5 rounded bg-blue-500/10"
            >
              {isCollapsed ? 'Expand comment' : 'Collapse comment'}
            </button>
          )}
        </div>
        <div className={`prose prose-invert prose-sm max-w-none text-app-muted prose-p:leading-relaxed prose-pre:bg-app-panel prose-pre:border prose-pre:border-app-border prose-pre:mt-4 relative ${isLong && isCollapsed ? 'line-clamp-6 overflow-hidden' : ''}`}>
          <Markdown 
            remarkPlugins={[remarkGfm, remarkAlert]} 
            rehypePlugins={[rehypeRaw]}
            components={{
              img: (props: any) => {
                const camoMap = extractCamoUrls(event.body_html);
                const src = camoMap.get(props.src) || props.src;
                return <img {...props} src={src} referrerPolicy="no-referrer" />
              },
                a: createMarkdownLinkRenderer(handleRelatedIssueClick, baseRepoUrl)
              }}
            >
              {processMarkdownMentions(event.body)}
            </Markdown>
          {isLong && isCollapsed && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-app-base to-transparent pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );
};

const extractRepoName = (url: string) => {
  if (!url) return 'Unknown';
  const match = url.match(/repos\/([^\/]+)\/([^\/]+)/);
  return match ? `${match[1]}/${match[2]}` : 'Unknown';
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [repositories, setRepositories] = useState<string[]>([]);
  const [newRepo, setNewRepo] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'inbox' | 'reviews' | 'mentions' | 'my-prs' | 'my-issues' | 'involved' | 'manage-repos' | 'assigned' | 'graph'>('inbox');
  const [mutedRepos, setMutedRepos] = useState<Record<string, boolean>>({'vercel/next.js': true});
  const [repoSearchQuery, setRepoSearchQuery] = useState("");
  const [allUserRepos, setAllUserRepos] = useState<any[]>([]);

  const [doneItems, setDoneItems] = useState<Record<number, string>>({});
  const [doneItemsLoaded, setDoneItemsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gittower_done_items');
      if (saved) setDoneItems(JSON.parse(saved));
    } catch (e) {}
    setDoneItemsLoaded(true);
  }, []);

  useEffect(() => {
    if (doneItemsLoaded) {
      localStorage.setItem('gittower_done_items', JSON.stringify(doneItems));
    }
  }, [doneItems, doneItemsLoaded]);

  const handleMarkDone = (id: number, updatedAt: string) => {
    setDoneItems(prev => ({ ...prev, [id]: updatedAt }));
  };

  const filterItems = (items: GitHubIssue[], ignoreDone: boolean = false) => items.filter(item => {
    if (mutedRepos[extractRepoName(item.repository_url)]) return false;
    
    if (!ignoreDone) {
      const doneUpdatedAt = doneItems[item.id];
      if (doneUpdatedAt && new Date(doneUpdatedAt).getTime() >= new Date(item.updated_at).getTime()) {
        return false;
      }
    }
    return true;
  });
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GitHubIssue | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [checks, setChecks] = useState<any>(null);
  const [isLoadingChecks, setIsLoadingChecks] = useState(false);
  const [globalWorkflows, setGlobalWorkflows] = useState<{active: any[], failed: any[]}>({ active: [], failed: [] });
  const [readItems, setReadItems] = useState<Set<number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gittower_read_items');
      if (saved) {
        try { return new Set<number>(JSON.parse(saved)); } catch (e) {}
      }
    }
    return new Set<number>();
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewModalPr, setReviewModalPr] = useState<any>(null);
  
  const [replyText, setReplyText] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [contributors, setContributors] = useState<{login: string, avatar_url: string}[]>([]);
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(true);
  const [caretCoords, setCaretCoords] = useState({ top: 0, left: 0 });
  const [showIssueMentions, setShowIssueMentions] = useState(false);
  const [issueMentionQuery, setIssueMentionQuery] = useState("");
  const [issueMentions, setIssueMentions] = useState<any[]>([]);
  const [isFetchingIssues, setIsFetchingIssues] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  const handleTriggerAiTriage = async () => {
    if (!selectedItem) return;
    setIsAnalyzingAi(true);
    try {
      const repo = extractRepoName(selectedItem.repository_url);
      const res = await fetch('/api/ai/analyze-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedItem.title,
          repo,
          number: selectedItem.number,
          author: selectedItem.user?.login,
          issueBody: selectedItem.body,
          state: selectedItem.state,
          comments: timeline.filter(t => t.event === 'commented' || (!t.event && t.body)).map(t => ({
            user: t.user?.login || 'unknown',
            body: t.body || '',
            createdAt: t.created_at || new Date().toISOString()
          })),
          isPullRequest: !!selectedItem.pull_request
        })
      });
      const json = await res.json();
      if (json.success) {
        setAiAnalysis(json.data);
      }
    } catch (e) {
      console.error('Failed to analyze with AI:', e);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMentions &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowMentions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMentions]);

  const executeAction = async (type: "COMMENT" | "CLOSE" | "REOPEN" | "MERGE") => {
    if (!selectedItem || (!replyText.trim() && type === "COMMENT")) return;
    
    setIsSubmitting(true);
    try {
      const repo = extractRepoName(selectedItem.repository_url);
      const res = await fetch("/api/github/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, repo, issueNumber: selectedItem.number, body: type === "COMMENT" ? replyText : undefined }),
      });

      if (!res.ok) throw new Error("Action failed");

      if (type === "COMMENT") {
        setReplyText("");
        if (user) {
          const newComment = {
            id: Date.now(),
            event: 'commented',
            user: { login: user.login, avatar_url: user.avatar_url },
            created_at: new Date().toISOString(),
            body: replyText
          };
          setTimeline(prev => [...prev, newComment]);
          setSelectedItem(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              comments_list: [...(prev.comments_list || []), newComment]
            };
          });
          
          fetch(`/api/github/timeline?repo=${repo}&issueNumber=${selectedItem.number}`)
            .then(res => res.json())
            .then(data => {
              if (!data.error && Array.isArray(data)) {
                setTimeline(data);
              }
            });
        }
      } else {
        setSelectedItem(null);
        fetchDashboard();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to execute action.");
    } finally {
      setIsSubmitting(false);
      setShowActionMenu(false);
    }
  };

  useEffect(() => {
    if (selectedItem?.repository_url && selectedItem?.number) {
      const repo = extractRepoName(selectedItem.repository_url);
      
      fetch(`/api/github/contributors?repo=${repo}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setContributors(data);
        });
        
      setIsLoadingTimeline(true);
      fetch(`/api/github/timeline?repo=${repo}&issueNumber=${selectedItem.number}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error && Array.isArray(data)) {
            setTimeline(data);
          }
        })
        .finally(() => setIsLoadingTimeline(false));
        
      if (selectedItem.pull_request) {
        setIsLoadingChecks(true);
        fetch(`/api/github/checks?repo=${repo}&pullNumber=${selectedItem.number}`)
          .then(res => res.json())
          .then(data => {
            if (!data.error) {
              setChecks(data);
            }
          })
          .catch(e => console.error("Failed to fetch checks", e))
          .finally(() => setIsLoadingChecks(false));
      } else {
        setChecks(null);
      }
    }
  }, [selectedItem?.repository_url, selectedItem?.number, selectedItem?.pull_request]);

  // Realtime Timeline & Checks Polling for active item
  useEffect(() => {
    if (selectedItem?.repository_url && selectedItem?.number) {
      const repo = extractRepoName(selectedItem.repository_url);
      
      const interval = setInterval(() => {
        fetch(`/api/github/timeline?repo=${repo}&issueNumber=${selectedItem.number}`)
          .then(res => res.json())
          .then(data => {
            if (!data.error && Array.isArray(data)) {
              setTimeline(data);
            }
          })
          .catch(() => {});
          
        if (selectedItem.pull_request) {
          fetch(`/api/github/checks?repo=${repo}&pullNumber=${selectedItem.number}`)
            .then(res => res.json())
            .then(data => {
              if (!data.error) setChecks(data);
            })
            .catch(() => {});
        }
      }, 15000); // Poll every 15 seconds
      
      return () => clearInterval(interval);
    }
  }, [selectedItem?.repository_url, selectedItem?.number, selectedItem?.pull_request]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setReplyText(text);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPosition);
    
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');
    
    // Check for @ mentions
    if (lastAtIndex !== -1 && lastAtIndex > lastHashIndex) {
      const isBeginningOrWhitespace = lastAtIndex === 0 || /\s/.test(textBeforeCursor[lastAtIndex - 1]);
      
      if (isBeginningOrWhitespace) {
        const query = textBeforeCursor.slice(lastAtIndex + 1);
        if (!/\s/.test(query)) {
          const coords = getCaretCoordinates(e.target, lastAtIndex);
          setCaretCoords(coords);
          setMentionQuery(query);
          setMentionIndex(lastAtIndex);
          setShowMentions(true);
          setShowIssueMentions(false);
          return;
        }
      }
    }

    // Check for # issue mentions
    if (lastHashIndex !== -1 && lastHashIndex > lastAtIndex) {
      const isBeginningOrWhitespace = lastHashIndex === 0 || /\s/.test(textBeforeCursor[lastHashIndex - 1]);
      
      if (isBeginningOrWhitespace) {
        const query = textBeforeCursor.slice(lastHashIndex + 1);
        if (!/\s/.test(query)) {
          const coords = getCaretCoordinates(e.target, lastHashIndex);
          setCaretCoords(coords);
          setIssueMentionQuery(query);
          setMentionIndex(lastHashIndex);
          setShowIssueMentions(true);
          setShowMentions(false);

          // Fetch issues matching query
          if (selectedItem?.repository_url) {
            const repoMatch = selectedItem.repository_url.match(/repos\/([^\/]+\/[^\/]+)/);
            if (repoMatch) {
              const repo = repoMatch[1];
              setIsFetchingIssues(true);
              fetch(`/api/github/search-issues?repo=${repo}&q=${query}`)
                .then(res => res.json())
                .then(data => {
                  if (!data.error && Array.isArray(data)) {
                    setIssueMentions(data);
                  }
                })
                .finally(() => setIsFetchingIssues(false));
            }
          }
          return;
        }
      }
    }
    
    setShowMentions(false);
    setShowIssueMentions(false);
  };

  const insertMention = (username: string) => {
    const textBeforeMention = replyText.slice(0, mentionIndex);
    const textAfterMention = replyText.slice(textareaRef.current?.selectionStart || replyText.length);
    const newText = `${textBeforeMention}@${username} ${textAfterMention}`;
    
    setReplyText(newText);
    setShowMentions(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = textBeforeMention.length + username.length + 2;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const insertIssueMention = (num: number) => {
    const textBeforeMention = replyText.slice(0, mentionIndex);
    const textAfterMention = replyText.slice(textareaRef.current?.selectionStart || replyText.length);
    const newText = `${textBeforeMention}#${num} ${textAfterMention}`;
    
    setReplyText(newText);
    setShowIssueMentions(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = textBeforeMention.length + num.toString().length + 2;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const applyFormat = (format: 'bold' | 'italic' | 'underline') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = replyText.slice(start, end);
    let before = replyText.slice(0, start);
    let after = replyText.slice(end);
    let formatted = '';
    
    if (format === 'bold') formatted = `**${selected}**`;
    else if (format === 'italic') formatted = `*${selected}*`;
    else if (format === 'underline') formatted = `<u>${selected}</u>`; 

    setReplyText(before + formatted + after);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        let offset = format === 'bold' ? 2 : (format === 'italic' ? 1 : 3);
        textareaRef.current.setSelectionRange(start + offset, start + offset + selected.length);
      }
    }, 0);
  };

  const handleItemSelected = (item: GitHubIssue | null, pushHistory = true) => {
    if (item) {
      setReadItems(prev => {
        const newSet = new Set(prev);
        newSet.add(item.id);
        localStorage.setItem('gittower_read_items', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      
      if (pushHistory) {
        const repoMatch = item.html_url?.match(/github\.com\/([^\/]+\/[^\/]+)/);
        const repo = repoMatch ? repoMatch[1] : '';
        window.history.pushState({}, '', `?view=${activeView}&issue=${repo}/${item.number}`);
      }
    } else if (pushHistory) {
      window.history.pushState({}, '', `?view=${activeView}`);
    }
    setAiAnalysis(null);
    setSelectedItem(item);
  };

  useEffect(() => {
    const handlePopState = async () => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view') as any;
      if (view && ['inbox', 'reviews', 'mentions', 'my-prs', 'involved', 'assigned', 'manage-repos'].includes(view)) {
        setActiveView(view);
      } else {
        setActiveView('inbox');
      }
      
      const issueParam = params.get('issue');
      if (issueParam) {
        const parts = issueParam.split('/');
        if (parts.length === 3) {
          const repo = `${parts[0]}/${parts[1]}`;
          const num = parts[2];
          try {
            const res = await fetch(`/api/github/issue?repo=${repo}&issueNumber=${num}`);
            if (res.ok) {
              const issue = await res.json();
              // Don't push history on popstate or initial load
              handleItemSelected(issue, false);
            }
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        handleItemSelected(null, false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState(); // Trigger on mount

    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeView]);

  const changeView = (view: typeof activeView) => {
    setActiveView(view);
    handleItemSelected(null, true);
    setIsMobileMenuOpen(false);
    window.history.pushState({}, '', `?view=${view}`);
    
    // Fetch all repos when opening manage-repos
    if (view === 'manage-repos' && allUserRepos.length === 0) {
      setLoadingRepos(true);
      fetch('/api/github/repos')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.repos) setAllUserRepos(data.repos);
        })
        .catch(() => {})
        .finally(() => setLoadingRepos(false));
    }
  };

  const handleRelatedIssueClick = async (num: string | number, baseUrl: string) => {
    const repoMatch = baseUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
    const repo = repoMatch ? repoMatch[1] : '';
    
    if (repo) {
      // Find if we already have it in data
      const allItems = [...(data?.reviewRequested || []), ...(data?.mentions || []), ...(data?.myPrs || []), ...(data?.myIssues || []), ...(data?.involved || []), ...(data?.assigned || [])];
      const existing = allItems.find(item => item.number === Number(num) && item.html_url.includes(repo));
      if (existing) {
        handleItemSelected(existing);
        return;
      }

      try {
        const res = await fetch(`/api/github/issue?repo=${repo}&issueNumber=${num}`);
        if (res.ok) {
          const issue = await res.json();
          handleItemSelected(issue, true);
        } else {
          window.open(`${baseUrl}/issues/${num}`, '_blank');
        }
      } catch (e) {
        window.open(`${baseUrl}/issues/${num}`, '_blank');
      }
    } else {
      window.open(`${baseUrl}/issues/${num}`, '_blank');
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/github/dashboard');
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      } else {
        console.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
    setLoading(false);
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/status');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.user);
          fetchDashboard();
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    }
  };

  // Realtime Dashboard Polling
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetch('/api/github/dashboard')
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) setData(data);
          })
          .catch(() => {});
      }, 30000); // Poll every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Realtime Global Workflows Polling
  useEffect(() => {
    if (isAuthenticated && data) {
      const activeRepos = Array.from(new Set([
        ...(data.reviewRequested || []),
        ...(data.mentions || []),
        ...(data.myPrs || []),
        ...(data.myIssues || []),
        ...(data.involved || []),
        ...(data.assigned || [])
      ].map((item: any) => extractRepoName(item.repository_url))));
      
      const fetchGlobalWorkflows = () => {
        if (activeRepos.length === 0) return;
        fetch(`/api/github/workflows?repos=${activeRepos.join(',')}&actor=${user?.login || ''}`)
          .then(res => res.ok ? res.json() : null)
          .then(wfData => {
            if (wfData && !wfData.error) setGlobalWorkflows(wfData);
          })
          .catch(() => {});
      };
      
      fetchGlobalWorkflows();
      const interval = setInterval(fetchGlobalWorkflows, 30000); // Poll every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, data]);

  useEffect(() => {
    setTimeout(() => checkAuth(), 0);
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setTimeout(() => checkAuth(), 0);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();

      const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setUser(null);
    setData(null);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-base">
        <Loader2 className="w-8 h-8 text-app-meta animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage onConnect={handleConnect} />;
  }

  // Derive RightSidebar props
  const rightSidebarWaitingOn = data?.myPrs?.filter(pr => pr.requested_reviewers && pr.requested_reviewers.length > 0).map(pr => ({
    id: `w-${pr.id}`,
    title: pr.title,
    reason: `Waiting for ${pr.requested_reviewers?.[0]?.login || 'reviewers'}`,
    url: pr.html_url
  })) || [];

  const rightSidebarTimeline = timeline?.slice(-5).map((t, i) => ({
    id: `t-${t.id || i}`,
    time: t.created_at ? formatDistanceToNow(new Date(t.created_at), { addSuffix: true }) : '',
    text: t.event === 'commented' ? 'Commented' : t.event === 'review_requested' ? 'Review Requested' : t.event || 'Activity',
    active: i === Math.min(timeline.length, 5) - 1,
    isError: t.event === 'failed'
  })).reverse() || [];
  
  const prActiveWork = checks?.pending_runs?.map((c: any) => ({
    id: `aw-${c.id}`,
    repo: selectedItem ? extractRepoName(selectedItem.repository_url) : 'Repo',
    avatar: selectedItem?.user?.avatar_url || '',
    name: c.name,
    status: 'Running',
    icon: 'yellow-dot' as const,
    url: c.html_url
  })) || [];
  
  const globalActiveWork = globalWorkflows.active.map((w: any) => ({
    id: `gaw-${w.id}`,
    repo: w.repo,
    avatar: w.actor_avatar,
    name: w.name,
    status: 'Running',
    icon: 'yellow-dot' as const,
    url: w.html_url
  }));

  const activeWorkNames = new Set(prActiveWork.map((w: any) => w.name + w.repo));
  const rightSidebarActiveWork = [
    ...prActiveWork, 
    ...globalActiveWork.filter((w: any) => !activeWorkNames.has(w.name + w.repo))
  ];
  
  const prBlockers = checks?.failed_runs?.map((c: any) => ({
    id: `b-${c.id}`,
    title: 'Check Failed',
    reason: c.name,
    color: 'bg-red-500',
    url: c.html_url
  })) || [];

  const globalBlockers = globalWorkflows.failed.map((w: any) => ({
    id: `gb-${w.id}`,
    title: 'Run Failed',
    reason: w.name,
    color: 'bg-red-500',
    url: w.html_url
  }));

  const blockerNames = new Set(prBlockers.map((b: any) => b.reason));
  const rightSidebarBlockers = [
    ...prBlockers,
    ...globalBlockers.filter((b: any) => !blockerNames.has(b.reason))
  ];

  if (checks && checks.mergeable === false && selectedItem) {
    rightSidebarBlockers.push({
      id: `mb-${selectedItem.id}`,
      title: 'Merge blocked',
      reason: checks.mergeable_state || 'Conflicts',
      color: 'bg-yellow-500'
    });
  }

  return (
    <div className="min-h-screen bg-app-base flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-app-border bg-app-base sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center text-white">
            <Github className="w-3 h-3" />
          </div>
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 tracking-wide text-lg">GitTower</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-app-muted hover:text-app-text">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-app-base text-app-muted flex flex-col border-r border-app-border transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:h-screen shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between gap-3 border-b border-app-border/50 bg-gradient-to-b from-app-base to-app-base/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Github className="w-5 h-5" />
            </div>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 tracking-wide text-lg">GitTower</span>
          </div>
          <button className="md:hidden text-app-muted p-1" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-4 pb-4">
          {(() => {
            const getCount = (key: keyof DashboardData) => {
              if (!data) return 0;
              return filterItems(data[key], key === 'myPrs').length;
            };
            const inboxCount = getCount('notifications');
            
            const renderNavItem = (id: any, label: string, Icon: any, count?: number) => {
              const isActive = activeView === id;
              return (
                <button 
                  onClick={() => changeView(id)} 
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left relative overflow-hidden ${
                    isActive 
                      ? 'bg-blue-500/10 text-blue-400 font-semibold' 
                      : 'text-app-muted hover:bg-app-panel hover:text-app-text font-medium'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[60%] bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  )}
                  <div className="flex items-center gap-3 relative z-10 pl-1">
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="text-sm">{label}</span>
                  </div>
                  {count !== undefined && count > 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors relative z-10 ${
                      isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-app-border text-app-meta group-hover:bg-app-panel group-hover:text-app-muted'
                    }`}>
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </button>
              );
            };

            return (
              <>
                {renderNavItem('inbox', 'Inbox', Inbox, inboxCount)}
                {renderNavItem('reviews', 'Review Requests', CheckSquare, getCount('reviewRequested'))}
                {renderNavItem('mentions', 'Mentions', AtSign, getCount('mentions'))}
                {renderNavItem('my-prs', 'My Pull Requests', GitPullRequest, getCount('myPrs'))}
                {renderNavItem('my-issues', 'My Issues', CircleDot, getCount('myIssues'))}
                {renderNavItem('involved', 'Involved', MessageCircle, getCount('involved'))}
                {renderNavItem('assigned', 'Assigned to me', ClipboardList, getCount('assigned'))}
                
                <div className="pt-6 pb-2">
                  <div className="px-3 text-xs font-bold text-app-meta uppercase tracking-widest">Views</div>
                </div>
                {renderNavItem('graph', 'Work Tree', FolderTree)}

                <div className="pt-6 pb-2">
                  <div className="px-3 text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Interview Demo
                  </div>
                </div>
                <button
                  onClick={() => setIsInterviewModalOpen(true)}
                  className="group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 border border-blue-500/30 text-blue-300 hover:text-white hover:border-blue-400 font-semibold shadow-lg shadow-blue-500/5"
                >
                  <div className="flex items-center gap-2.5 pl-1">
                    <Terminal className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Interview Showcase</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Live
                  </span>
                </button>
                
                <div className="pt-6 pb-2">
                  <div className="px-3 text-xs font-bold text-app-meta uppercase tracking-widest">Settings</div>
                </div>
                {renderNavItem('manage-repos', 'Manage Repositories', Settings)}
              </>
            );
          })()}
        </nav>

        {user && (
          <div className="p-4 border-t border-app-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src={user.avatar_url} alt={user.login} width={32} height={32} className="w-8 h-8 rounded-full bg-app-sidebar" referrerPolicy="no-referrer" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-app-text truncate max-w-[100px]">{user.name || user.login}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-app-panel rounded-lg text-app-meta hover:text-app-text transition-colors" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative w-full">
        <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-8 md:space-y-12">
          
          {selectedItem ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => handleItemSelected(null)} 
                  className="flex items-center gap-2 text-sm text-app-muted hover:text-app-text transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to list
                </button>
                <a 
                  href={selectedItem.html_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-app-muted hover:text-app-text transition-colors bg-app-base hover:bg-app-base/80 px-3 py-1.5 rounded-lg border border-app-border/50"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in GitHub
                </a>
              </div>
              
              <div className="border-b border-app-border pb-6">
                <div className="flex items-center gap-3 text-sm text-app-muted mb-3">
                  <span className="font-medium text-app-text">{extractRepoName(selectedItem.repository_url)}</span>
                  <span>•</span>
                  <span>#{selectedItem.number}</span>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20 capitalize">
                    {selectedItem.state}
                  </span>
                  {selectedItem.draft && (
                    <span className="px-2 py-0.5 rounded-full bg-app-panel text-app-meta text-xs font-medium border border-app-border">
                      Draft
                    </span>
                  )}
                </div>
                
                <div className="flex items-start justify-between mb-4 gap-4">
                  <h1 className="text-2xl font-semibold text-app-text leading-tight flex-1 break-words">{selectedItem.title}</h1>
                  
                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    <button
                      onClick={handleTriggerAiTriage}
                      disabled={isAnalyzingAi}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      {isAnalyzingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-blue-200" />}
                      AI Triage
                    </button>
                    {selectedItem.pull_request && (
                      <div className="relative group">
                        <button className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                          <Code2 className="w-4 h-4" /> Code <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="absolute right-0 top-full mt-2 w-48 bg-app-panel border border-app-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          <div className="p-1">
                            <a href={selectedItem.html_url.replace('github.com', 'github.dev')} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 text-sm text-app-muted hover:text-app-text hover:bg-app-base rounded-lg transition-colors">
                              <Monitor className="w-4 h-4" /> Edit on Web
                            </a>
                            <a href={`https://codespaces.new/${extractRepoName(selectedItem.repository_url)}/pull/${selectedItem.number}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 text-sm text-app-muted hover:text-app-text hover:bg-app-base rounded-lg transition-colors">
                              <Box className="w-4 h-4" /> Open in Codespaces
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-app-muted">
                  <Image src={selectedItem.user.avatar_url} alt={selectedItem.user.login} width={24} height={24} className="rounded-full" />
                  <span className="font-medium text-app-text">{selectedItem.user.login}</span>
                  <span>opened this on {new Date(selectedItem.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Timeline / Conversation */}
                <div className="flex-1 relative min-w-0 pb-8">
                  {/* Vertical line connecting timeline */}
                  <div className="absolute left-[19px] top-4 bottom-0 w-[2px] bg-app-border z-0"></div>
                  
                  <div className="space-y-8">
                    {/* AI Intelligence Card */}
                    {aiAnalysis && (
                      <div className="relative z-10">
                        <AIInsightCard analysis={aiAnalysis} />
                      </div>
                    )}

                    {/* OP Body */}
                    <div className="relative z-10 flex gap-4">
                      <div className="shrink-0 mt-1">
                        <Image src={selectedItem.user.avatar_url} alt={selectedItem.user.login} width={40} height={40} className="rounded-full ring-4 ring-app-base" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-3 mb-1 justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-app-text">{selectedItem.user.login}</span>
                            <span className="text-app-meta text-sm">{formatDistanceToNow(new Date(selectedItem.created_at), { addSuffix: true })}</span>
                          </div>
                          {selectedItem.body && selectedItem.body.length > 300 && (
                            <button 
                              onClick={() => setIsDescriptionCollapsed(!isDescriptionCollapsed)}
                              className="text-xs text-blue-500 hover:underline px-2 py-0.5 rounded bg-blue-500/10"
                            >
                              {isDescriptionCollapsed ? 'Expand description' : 'Collapse description'}
                            </button>
                          )}
                        </div>
                        <div className={`prose prose-invert prose-sm max-w-none text-app-muted prose-p:leading-relaxed prose-pre:bg-app-panel prose-pre:border prose-pre:border-app-border prose-pre:mt-4 relative ${selectedItem.body && selectedItem.body.length > 300 && isDescriptionCollapsed ? 'line-clamp-6 overflow-hidden' : ''}`}>
                          <Markdown 
                            remarkPlugins={[remarkGfm, remarkAlert]} 
                            rehypePlugins={[rehypeRaw]}
                            components={{
                              img: (props: any) => {
                                const camoMap = extractCamoUrls(selectedItem.body_html);
                                const src = camoMap.get(props.src) || props.src;
                                return <img {...props} src={src} referrerPolicy="no-referrer" />
                              },
                              a: createMarkdownLinkRenderer(handleRelatedIssueClick, selectedItem.repository_url)
                            }}
                          >
                            {processMarkdownMentions(selectedItem.body || "*No description provided.*")}
                          </Markdown>
                          {selectedItem.body && selectedItem.body.length > 300 && isDescriptionCollapsed && (
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-app-base to-transparent pointer-events-none" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Full Timeline */}
                    {isLoadingTimeline ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-app-meta" />
                      </div>
                    ) : (
                      timeline.map((event: any, index: number) => {
                        const key = event.id || `event-${index}`;
                        
                        // Comment Event
                        if (event.event === 'commented' || (!event.event && event.body)) {
                          return <TimelineComment key={key} event={event} handleRelatedIssueClick={handleRelatedIssueClick} baseRepoUrl={selectedItem?.repository_url} />;
                        }

                        if (event.event === 'assigned' || event.event === 'unassigned') {
                          const Icon = event.event === 'assigned' ? UserPlus : UserMinus;
                          return (
                            <div key={key} className="relative z-10 flex items-center gap-3 py-2 pl-4 ml-1">
                              <div className="bg-app-base p-1.5 rounded-full z-10 ring-4 ring-app-base text-app-meta">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="text-sm text-app-muted flex items-center gap-2">
                                <Image src={event.actor.avatar_url} alt={event.actor.login} width={20} height={20} className="rounded-full" />
                                <span className="font-medium text-app-text">{event.actor.login}</span>
                                {event.event} <span className="font-medium text-app-text">{event.assignee?.login}</span>
                                <span className="text-app-meta text-xs ml-1">{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
                              </div>
                            </div>
                          );
                        }

                        if (event.event === 'labeled' || event.event === 'unlabeled') {
                          return (
                            <div key={key} className="relative z-10 flex items-center gap-3 py-2 pl-4 ml-1">
                              <div className="bg-app-base p-1.5 rounded-full z-10 ring-4 ring-app-base text-app-meta">
                                <Tag className="w-4 h-4" />
                              </div>
                              <div className="text-sm text-app-muted flex items-center gap-2">
                                <Image src={event.actor.avatar_url} alt={event.actor.login} width={20} height={20} className="rounded-full" />
                                <span className="font-medium text-app-text">{event.actor.login}</span>
                                {event.event} <span className="font-medium px-1.5 py-0.5 rounded-full border border-app-border text-app-text text-xs" style={{backgroundColor: `#${event.label?.color}20`, borderColor: `#${event.label?.color}50`}}>{event.label?.name}</span>
                                <span className="text-app-meta text-xs ml-1">{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
                              </div>
                            </div>
                          );
                        }

                        if (event.event === 'cross-referenced' && event.source) {
                          const isPR = !!event.source.issue?.pull_request;
                          const state = event.source.issue?.state;
                          const merged = event.source.issue?.pull_request?.merged_at;
                          
                          let Icon = AlertCircle;
                          let iconColor = 'text-green-400';
                          
                          if (isPR) {
                            Icon = GitPullRequest;
                            if (merged) {
                              Icon = GitMerge;
                              iconColor = 'text-purple-400';
                            } else if (state === 'closed') {
                              iconColor = 'text-red-400';
                            } else {
                              iconColor = 'text-green-400';
                            }
                          } else {
                            if (state === 'closed') {
                              Icon = CheckCircle2;
                              iconColor = 'text-purple-400';
                            }
                          }

                          // Detect if this is a closing/linking reference
                          const issueNumber = selectedItem?.number;
                          const sourceBody = (event.source.issue?.body || '').toLowerCase();
                          const closingKeywords = ['close', 'closes', 'closed', 'fix', 'fixes', 'fixed', 'resolve', 'resolves', 'resolved'];
                          const isClosingRef = isPR && issueNumber && closingKeywords.some(kw => 
                            sourceBody.includes(`${kw} #${issueNumber}`) || 
                            sourceBody.includes(`${kw}s #${issueNumber}`)
                          );

                          const actionText = isClosingRef 
                            ? 'linked a pull request that will close this issue' 
                            : 'mentioned this';

                          return (
                            <div key={key} className="relative z-10 flex items-start gap-3 py-2 pl-4 ml-1">
                              <div className="bg-app-base p-1.5 rounded-full z-10 ring-4 ring-app-base text-app-meta mt-0.5">
                                <Link2 className="w-4 h-4" />
                              </div>
                              <div className="text-sm text-app-muted flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Image src={event.actor.avatar_url} alt={event.actor.login} width={20} height={20} className="rounded-full" />
                                  <span className="font-medium text-app-text">{event.actor.login}</span>
                                  {actionText} {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                                </div>
                                <a href={event.source.issue.html_url} target="_blank" rel="noreferrer" className="block mt-2 p-3 bg-app-panel border border-app-border rounded-xl hover:border-app-meta transition-colors flex items-center gap-3">
                                  <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
                                  <span className="font-medium text-app-text truncate">{event.source.issue.title}</span>
                                  <span className="text-app-meta shrink-0">#{event.source.issue.number}</span>
                                </a>
                              </div>
                            </div>
                          );
                        }

                        if (event.event === 'closed' || event.event === 'reopened' || event.event === 'merged') {
                          let Icon = AlertCircle;
                          let color = 'text-red-400';
                          if (event.event === 'reopened') { Icon = CheckCircle2; color = 'text-green-400'; }
                          if (event.event === 'merged') { Icon = GitMerge; color = 'text-purple-400'; }
                          
                          return (
                            <div key={key} className="relative z-10 flex items-center gap-3 py-2 pl-4 ml-1">
                              <div className={`bg-app-base p-1.5 rounded-full z-10 ring-4 ring-app-base ${color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="text-sm text-app-muted flex items-center gap-2">
                                <Image src={event.actor.avatar_url} alt={event.actor.login} width={20} height={20} className="rounded-full" />
                                <span className="font-medium text-app-text">{event.actor.login}</span>
                                {event.event} this
                                <span className="text-app-meta text-xs ml-1">{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
                              </div>
                            </div>
                          );
                        }

                        // Ignore other noisy events
                        return null;
                      })
                    )}
                  </div>

                  {/* Detailed Mergeability & CI/CD Checks Box */}
                  {selectedItem.pull_request && checks && (
                    <div className="mb-6 rounded-xl border border-app-border overflow-hidden bg-app-base relative z-10 flex flex-col mt-12">
                      
                      {/* Conflicts Box */}
                      {checks.mergeable === false && (
                        <div className="p-4 flex items-center justify-between border-b border-app-border bg-app-panel">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-app-meta bg-app-base p-1.5 rounded-full ring-4 ring-app-base z-10 relative left-[-2px]">
                              <AlertOctagon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-app-text">This branch has conflicts that must be resolved</h3>
                              <p className="text-xs text-app-meta mt-1">
                                Use the web editor or the command line to resolve conflicts before continuing.
                              </p>
                            </div>
                          </div>
                          <a href={selectedItem.html_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-app-base hover:bg-app-base/80 border border-app-border rounded-md text-xs font-medium transition-colors whitespace-nowrap text-app-text shrink-0">
                            Resolve conflicts <ChevronDown className="w-3 h-3 inline-block ml-1" />
                          </a>
                        </div>
                      )}

                      {/* Draft Box */}
                      {selectedItem.draft && (
                        <div className="p-4 flex items-center justify-between border-b border-app-border bg-app-panel">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-app-meta bg-app-base p-1.5 rounded-full ring-4 ring-app-base z-10 relative left-[-2px]">
                              <GitPullRequestDraft className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-app-text">This pull request is still a work in progress</h3>
                              <p className="text-xs text-app-meta mt-1">
                                Draft pull requests cannot be merged.
                              </p>
                            </div>
                          </div>
                          <a href={selectedItem.html_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-app-base hover:bg-app-base/80 border border-app-border rounded-md text-xs font-medium transition-colors whitespace-nowrap text-app-text shrink-0">
                            Ready for review
                          </a>
                        </div>
                      )}

                      {/* Review Required Box */}
                      {checks.requested_reviewers?.length > 0 && (
                        <div className="p-4 flex items-center justify-between border-b border-app-border bg-app-panel">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-red-500 bg-red-500/10 p-1.5 rounded-full ring-4 ring-app-base z-10 relative left-[-2px]">
                              <Ban className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-app-text">Review required</h3>
                              <p className="text-xs text-app-meta mt-1">
                                At least 1 approving review is required by reviewers with write access.
                              </p>
                            </div>
                          </div>
                          {user?.login && selectedItem.user.login !== user.login && (
                            <button
                              onClick={() => {
                                setReviewModalPr({
                                  number: selectedItem.number,
                                  title: selectedItem.title,
                                  repo: extractRepoName(selectedItem.repository_url),
                                  author: selectedItem.user.login,
                                  body: selectedItem.body,
                                  html_url: selectedItem.html_url,
                                });
                                setIsReviewModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              Add your review
                            </button>
                          )}
                        </div>
                      )}

                      {/* Workflows Awaiting Approval Box */}
                      {checks.waiting_approval > 0 && (
                        <div className="p-4 flex items-start gap-3 border-b border-app-border bg-app-panel">
                          <div className="mt-0.5 text-yellow-500 bg-yellow-500/10 p-1.5 rounded-full ring-4 ring-app-base z-10 relative left-[-2px]">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-app-text">{checks.waiting_approval} {checks.waiting_approval === 1 ? 'workflow' : 'workflows'} awaiting approval</h3>
                            <p className="text-xs text-app-meta mt-1">
                              This workflow requires approval from a maintainer. <a href="#" className="text-blue-500 hover:underline">Learn more about approving workflows.</a>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Grouped Checks */}
                      {checks.total > 0 && (
                        <div className="flex flex-col border-b border-app-border">
                          {(() => {
                            const getCheckMeta = (run: any) => {
                              if (run.conclusion === 'skipped' && run.completed_at) {
                                return `Skipped ${formatDistanceToNow(new Date(run.completed_at), { addSuffix: true })}`;
                              }
                              if (run.started_at && run.completed_at) {
                                const durationSec = Math.round((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000);
                                if (durationSec < 60) return `${run.conclusion === 'success' ? 'Successful' : 'Failed'} in ${durationSec}s`;
                                return `${run.conclusion === 'success' ? 'Successful' : 'Failed'} in ${Math.round(durationSec/60)}m ${durationSec%60}s`;
                              }
                              return run.conclusion === 'success' ? 'Successful' : (run.conclusion === 'skipped' ? 'Skipped' : 'Failed');
                            };
                            return (
                              <>
                                {checks.pending_runs && checks.pending_runs.length > 0 && (
                                  <div>
                                    <div className="px-4 py-2 bg-app-base border-b border-app-border text-xs font-semibold text-app-text">
                                      pending checks
                                    </div>
                                    <div className="divide-y divide-app-border border-b border-app-border">
                                      {checks.pending_runs.map((run: any) => (
                                        <div key={run.id} className="p-3 px-4 flex items-center gap-3 bg-app-panel text-sm hover:bg-app-base transition-colors">
                                          <div className="flex-shrink-0">
                                            {run.status === 'waiting' || run.conclusion === 'action_required' ? (
                                              <Clock className="w-4 h-4 text-yellow-500" />
                                            ) : (
                                              <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                                            )}
                                          </div>
                                          <div className="font-medium text-app-text flex-1 flex items-center gap-2">
                                            <Github className="w-4 h-4 text-app-meta" />
                                            <span>{run.app_name !== 'GitHub Actions' ? `${run.app_name} / ` : ''}{run.name}</span>
                                          </div>
                                          <span className="text-app-meta text-xs">Waiting</span>
                                          <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs ml-2">Details</a>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {checks.failed_runs && checks.failed_runs.length > 0 && (
                                  <div>
                                    <div className="px-4 py-2 bg-app-base border-b border-app-border text-xs font-semibold text-app-text">
                                      failing checks
                                    </div>
                                    <div className="divide-y divide-app-border border-b border-app-border">
                                      {checks.failed_runs.map((run: any) => (
                                        <div key={run.id} className="p-3 px-4 flex items-center gap-3 bg-app-panel text-sm hover:bg-app-base transition-colors">
                                          <div className="flex-shrink-0">
                                            <X className="w-4 h-4 text-red-500" />
                                          </div>
                                          <div className="font-medium text-app-text flex-1 flex items-center gap-2">
                                            <Github className="w-4 h-4 text-app-meta" />
                                            <span>{run.app_name !== 'GitHub Actions' ? `${run.app_name} / ` : ''}{run.name}</span>
                                          </div>
                                          <span className="text-app-meta text-xs">{getCheckMeta(run)}</span>
                                          <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs ml-2">Details</a>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {checks.skipped_runs && checks.skipped_runs.length > 0 && (
                                  <div>
                                    <div className="px-4 py-2 bg-app-base border-b border-app-border text-xs font-semibold text-app-text">
                                      skipped checks
                                    </div>
                                    <div className="divide-y divide-app-border border-b border-app-border">
                                      {checks.skipped_runs.map((run: any) => (
                                        <div key={run.id} className="p-3 px-4 flex items-center gap-3 bg-app-panel text-sm hover:bg-app-base transition-colors">
                                          <div className="flex-shrink-0">
                                            <Ban className="w-4 h-4 text-app-meta" />
                                          </div>
                                          <div className="font-medium text-app-text flex-1 flex items-center gap-2 text-app-meta">
                                            <Github className="w-4 h-4" />
                                            <span className="line-through">{run.app_name !== 'GitHub Actions' ? `${run.app_name} / ` : ''}{run.name}</span>
                                          </div>
                                          <span className="text-app-meta text-xs">{getCheckMeta(run)}</span>
                                          <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs ml-2">Details</a>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {checks.successful_runs && checks.successful_runs.length > 0 && (
                                  <div>
                                    <div className="px-4 py-2 bg-app-base border-b border-app-border text-xs font-semibold text-app-text">
                                      successful checks
                                    </div>
                                    <div className="divide-y divide-app-border">
                                      {checks.successful_runs.map((run: any) => (
                                        <div key={run.id} className="p-3 px-4 flex items-center gap-3 bg-app-panel text-sm hover:bg-app-base transition-colors">
                                          <div className="flex-shrink-0">
                                            <Check className="w-4 h-4 text-green-500" />
                                          </div>
                                          <div className="font-medium text-app-text flex-1 flex items-center gap-2">
                                            <Github className="w-4 h-4 text-app-meta" />
                                            <span>{run.app_name !== 'GitHub Actions' ? `${run.app_name} / ` : ''}{run.name}</span>
                                          </div>
                                          <span className="text-app-meta text-xs">{getCheckMeta(run)}</span>
                                          <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs ml-2">Details</a>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {/* Merging is Blocked Warning */}
                      {checks.mergeable_state === 'blocked' && (
                        <div className="p-4 flex items-start gap-3 bg-red-500/5">
                          <div className="mt-0.5 text-red-500">
                            <X className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-red-500">Merging is blocked</h3>
                            <p className="text-xs text-app-meta mt-1">
                              New changes require approval from someone other than the last pusher.
                            </p>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Context-Aware Action Box */}
                  {(() => {
                    const isPullRequest = !!selectedItem.html_url?.includes('/pull/');
                    const repoOwner = extractRepoName(selectedItem.repository_url).split('/')[0];
                    const isRepoOwner = user?.login && repoOwner.toLowerCase() === user.login.toLowerCase();
                    const isAuthor = user?.login && selectedItem.user.login === user.login;
                    
                    // If we have fetched checks data for a PR, we have the true permissions from the base repo!
                    const hasWriteAccess = checks?.permissions ? checks.permissions.push : isRepoOwner;
                    
                    const canClose = hasWriteAccess || isAuthor;
                    
                    // Disable merge button if they lack write access, or there are conflicts, failing checks, or it's a draft
                    const canMerge = isPullRequest && hasWriteAccess && checks?.mergeable !== false && checks?.mergeable_state !== 'blocked' && !selectedItem.draft;
                    
                    return (
                      <div className="bg-app-panel border border-app-border rounded-xl shadow-sm p-4 mb-6 mt-6 relative z-10">
                        {isPullRequest ? (
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-2 rounded-lg ${canMerge ? 'bg-purple-500/10 text-purple-400' : 'bg-app-base text-app-meta'}`}>
                                <GitMerge className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-app-text">Merge Pull Request</h3>
                                <p className="text-xs text-app-meta mt-0.5">
                                  {canMerge ? "Ready to be merged into the base branch." : "Only those with write access to this repository can merge pull requests."}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                              <button 
                                disabled={!canMerge || isSubmitting || selectedItem.state !== 'open'}
                                onClick={() => executeAction('MERGE')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${(!canMerge || selectedItem.state !== 'open') ? 'bg-app-base text-app-meta border border-app-border/50' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                              >
                                {isSubmitting && selectedItem.state === 'open' ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitMerge className="w-4 h-4" />}
                                Merge pull request
                              </button>
                              {selectedItem.state === 'open' ? (
                                <button 
                                  disabled={!canClose || isSubmitting}
                                  onClick={() => executeAction('CLOSE')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${!canClose ? 'bg-app-base text-app-meta border border-app-border/50' : 'bg-app-base hover:bg-app-base/80 text-app-text border border-app-border/50'}`}
                                >
                                  Close pull request
                                </button>
                              ) : (
                                  <button 
                                    disabled={!canClose || isSubmitting}
                                    onClick={() => executeAction('REOPEN')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${!canClose ? 'bg-app-base text-app-meta border border-app-border/50' : 'bg-app-base hover:bg-app-base/80 text-app-text border border-app-border/50'}`}
                                  >
                                    Reopen pull request
                                  </button>
                                )}
                                </div>
                              </div>
                          ) : (
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-2 rounded-lg ${canClose ? 'bg-red-500/10 text-red-400' : 'bg-app-base text-app-meta'}`}>
                                <AlertCircle className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-app-text">Close Issue</h3>
                                <p className="text-xs text-app-meta mt-0.5">
                                  {canClose ? "This issue is active." : "You do not have permission to close this issue."}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                              {selectedItem.state === 'open' ? (
                                <button 
                                  disabled={!canClose || isSubmitting}
                                  onClick={() => executeAction('CLOSE')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${!canClose ? 'bg-app-base text-app-meta border border-app-border/50' : 'bg-app-base hover:bg-app-base/80 text-red-400 border border-red-500/20'}`}
                                >
                                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                  Close issue
                                </button>
                              ) : (
                                <button 
                                  disabled={!canClose || isSubmitting}
                                  onClick={() => executeAction('REOPEN')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${!canClose ? 'bg-app-base text-app-meta border border-app-border/50' : 'bg-app-base hover:bg-app-base/80 text-app-text border border-app-border/50'}`}
                                >
                                  Reopen issue
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  {/* Floating Reply Box */}
                  <div className="sticky bottom-6 z-20 pt-2">
                    <div className="bg-app-panel border border-app-border rounded-xl shadow-xl p-2 relative">
                      <AnimatePresence>
                        {showMentions && contributors.filter(c => c.login.toLowerCase().includes(mentionQuery.toLowerCase())).length > 0 && (
                          <motion.div 
                            ref={suggestionsRef}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            style={{ bottom: '100%', left: caretCoords.left + 8, marginBottom: '8px' }}
                            className="absolute w-64 bg-[#1C1C21] border border-app-border rounded-xl shadow-2xl z-50 flex flex-col max-h-56"
                          >
                            <div className="overflow-y-auto p-1.5">
                              {contributors.filter(c => c.login.toLowerCase().includes(mentionQuery.toLowerCase())).map(c => (
                                <button
                                  key={c.login}
                                  onClick={() => insertMention(c.login)}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-app-base transition-colors rounded-lg text-left"
                                >
                                  <Image src={c.avatar_url} alt={c.login} width={24} height={24} className="rounded-full shrink-0" />
                                  <span className="text-sm font-medium text-app-text truncate">{c.login}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                        {showIssueMentions && (
                          <motion.div 
                            ref={suggestionsRef}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            style={{ bottom: '100%', left: caretCoords.left + 8, marginBottom: '8px' }}
                            className="absolute z-50 w-72 max-w-sm max-h-64 flex flex-col overflow-hidden bg-app-panel border border-app-border rounded-lg shadow-xl"
                          >
                            <div className="p-2 border-b border-app-border shrink-0">
                              <span className="text-xs font-semibold text-app-meta px-2">Link Issue or Pull Request</span>
                            </div>
                            <div className="overflow-y-auto min-h-0">
                              {isFetchingIssues ? (
                                <div className="p-4 flex items-center justify-center">
                                  <Loader2 className="w-4 h-4 animate-spin text-app-meta" />
                                </div>
                              ) : issueMentions.length > 0 ? (
                                <div className="p-1">
                                  {issueMentions.map((issue: any) => (
                                    <button
                                      key={issue.id}
                                      onClick={() => insertIssueMention(issue.number)}
                                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-app-base transition-colors flex items-center gap-3 group"
                                    >
                                      {issue.pull_request ? <GitPullRequest className="w-4 h-4 text-purple-500 flex-shrink-0" /> : <CheckSquare className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                      <div className="flex flex-col overflow-hidden">
                                        <span className="text-app-text truncate">{issue.title}</span>
                                        <span className="text-app-meta text-xs">#{issue.number}</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-4 text-center text-xs text-app-meta">No issues found matching "{issueMentionQuery}"</div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <textarea 
                        ref={textareaRef}
                        value={replyText}
                        onChange={handleTextareaChange}
                        onKeyDown={(e) => {
                          if (e.ctrlKey || e.metaKey) {
                            if (e.key === 'b') {
                              e.preventDefault();
                              applyFormat('bold');
                            } else if (e.key === 'i') {
                              e.preventDefault();
                              applyFormat('italic');
                            } else if (e.key === 'u') {
                              e.preventDefault();
                              applyFormat('underline');
                            }
                          }
                        }}
                        placeholder="Reply..."
                        className="w-full bg-transparent p-3 text-app-text text-sm placeholder:text-app-meta focus:outline-none min-h-[60px] resize-none"
                      ></textarea>
                      <div className="flex items-center justify-between mt-2 px-2 pb-1 relative">
                        <div className="flex items-center gap-1 text-app-meta text-xs font-medium">
                          <button onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-app-base hover:text-app-text rounded transition-colors" title="Bold (Ctrl+B)">
                            <Bold className="w-4 h-4" />
                          </button>
                          <button onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-app-base hover:text-app-text rounded transition-colors" title="Italic (Ctrl+I)">
                            <Italic className="w-4 h-4" />
                          </button>
                          <div className="w-px h-4 bg-app-border mx-1"></div>
                          <button onClick={() => { setReplyText(prev => prev + '@'); textareaRef.current?.focus(); }} className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-app-base hover:text-app-text rounded transition-colors" title="Mention user (@)">
                            <AtSignIcon className="w-3.5 h-3.5" /> <span>Mention</span>
                          </button>
                          <button onClick={() => { setReplyText(prev => prev + '#'); textareaRef.current?.focus(); }} className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-app-base hover:text-app-text rounded transition-colors" title="Link issue (#)">
                            <Hash className="w-3.5 h-3.5" /> <span>Issue</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => executeAction('COMMENT')}
                            disabled={!replyText.trim() || isSubmitting}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} 
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                


                {/* Right Sidebar */}
                <div className="w-full lg:w-[260px] shrink-0 space-y-8 pt-2 relative z-10 lg:pl-4">
                  {/* Reviewers */}
                  <div>
                    <div className="text-xs font-semibold text-app-meta uppercase tracking-wider mb-3">Reviewers</div>
                    {selectedItem.requested_reviewers && selectedItem.requested_reviewers.length > 0 ? (
                      <div className="flex flex-col gap-2 text-sm">
                        {selectedItem.requested_reviewers.map(r => (
                          <div key={r.login} className="flex items-center gap-2">
                            <Image src={r.avatar_url} alt={r.login} width={20} height={20} className="rounded-full" />
                            <span className="text-app-text font-medium">{r.login}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-app-muted">No reviewers requested</div>
                    )}
                  </div>

                  {/* Assignees */}
                  <div className="pt-6 border-t border-app-border">
                    <div className="text-xs font-semibold text-app-meta uppercase tracking-wider mb-3">Assignees</div>
                    {selectedItem.assignees && selectedItem.assignees.length > 0 ? (
                      <div className="flex flex-col gap-2 text-sm">
                        {selectedItem.assignees.map(a => (
                          <div key={a.login} className="flex items-center gap-2">
                            <Image src={a.avatar_url} alt={a.login} width={20} height={20} className="rounded-full" />
                            <span className="text-app-text font-medium">{a.login}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-app-muted">No one assigned</div>
                    )}
                  </div>

                  {/* Labels */}
                  <div className="pt-6 border-t border-app-border">
                    <div className="text-xs font-semibold text-app-meta uppercase tracking-wider mb-3">Labels</div>
                    {selectedItem.labels && selectedItem.labels.length > 0 ? (
                      <div className="flex flex-wrap gap-2 text-sm">
                        {selectedItem.labels.map(l => (
                          <span key={l.name} className="px-2 py-0.5 rounded-full text-xs font-medium border" style={{ backgroundColor: `#${l.color}20`, borderColor: `#${l.color}40`, color: `#${l.color}` }}>
                            {l.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-app-muted">None yet</div>
                    )}
                  </div>

                  {/* Related Issue */}
                  {(() => {
                    const linkedIssueNumbers = selectedItem.body ? Array.from(new Set([...selectedItem.body.matchAll(/(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s+(?:#|https:\/\/github\.com\/[^\/]+\/[^\/]+\/issues\/)(\d+)/gi)].map(m => m[1]))) : [];
                    const baseUrl = selectedItem.html_url?.split('/pull/')[0]?.split('/issues/')[0];
                    
                    if (selectedItem.related_issue || linkedIssueNumbers.length > 0) {
                      return (
                        <div className="pt-6 border-t border-app-border">
                          <div className="text-xs font-semibold text-app-meta uppercase tracking-wider mb-3">Related Issue</div>
                          <div className="flex flex-col gap-2">
                            {selectedItem.related_issue && (
                                <button 
                                  onClick={() => handleRelatedIssueClick(selectedItem.related_issue?.number || 0, baseUrl)} 
                                  className="inline-flex items-start text-left gap-2 text-sm text-blue-500 hover:text-blue-400 hover:underline"
                                >
                                  #{selectedItem.related_issue?.number} {selectedItem.related_issue?.title}
                              </button>
                            )}
                            {linkedIssueNumbers.map(num => (
                              <button 
                                key={num} 
                                onClick={() => handleRelatedIssueClick(num, baseUrl)} 
                                className="inline-flex items-start text-left gap-2 text-sm text-blue-500 hover:text-blue-400 hover:underline"
                              >
                                #{num} (Closes this issue)
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {(() => {
                    const participantsMap = new Map();
                    if (selectedItem.user) participantsMap.set(selectedItem.user.login, selectedItem.user);
                    timeline.forEach((event: any) => {
                      if (event.user) participantsMap.set(event.user.login, event.user);
                      if (event.actor) participantsMap.set(event.actor.login, event.actor);
                    });
                    const participants = Array.from(participantsMap.values());

                    const developmentPRs = timeline
                      .filter((event: any) => event.event === 'cross-referenced' && event.source?.issue?.pull_request)
                      .map((event: any) => event.source.issue);
                    const uniqueDevPRsMap = new Map();
                    developmentPRs.forEach((pr: any) => uniqueDevPRsMap.set(pr.number, pr));
                    const uniqueDevPRs = Array.from(uniqueDevPRsMap.values());

                    return (
                      <>
                        {!selectedItem.pull_request && uniqueDevPRs.length > 0 && (
                          <div className="pt-6 border-t border-app-border">
                            <div className="text-xs font-semibold text-app-meta uppercase tracking-wider mb-3">Development</div>
                            <div className="flex flex-col gap-2 text-sm">
                              {uniqueDevPRs.map((pr: any) => {
                                const isMerged = pr.pull_request?.merged_at != null || pr.state === 'closed';
                                const repoName = extractRepoName(pr.repository_url || selectedItem.repository_url);
                                const isSameRepo = repoName === extractRepoName(selectedItem.repository_url);
                                return (
                                  <a key={pr.number} href={pr.html_url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-app-text hover:text-blue-400 group">
                                    {isMerged ? <GitMerge className="w-4 h-4 shrink-0 mt-0.5 text-purple-500" /> : <GitPullRequest className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />}
                                    <span className="group-hover:underline break-all">
                                      {isSameRepo ? `#${pr.number}` : `${repoName}#${pr.number}`}
                                    </span>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <div className="pt-6 border-t border-app-border">
                          <div className="text-xs font-semibold text-app-meta uppercase tracking-wider mb-3">
                            {participants.length} {participants.length === 1 ? 'Participant' : 'Participants'}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {participants.map((p: any) => (
                              <Image key={p.login} src={p.avatar_url} alt={p.login} width={26} height={26} className="rounded-full ring-2 ring-app-base hover:ring-blue-500 transition-all cursor-pointer" title={p.login} />
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <header className="flex items-center justify-between mb-8">
                <div>
              <h1 className="text-2xl font-semibold text-app-text tracking-tight">
                {activeView === 'inbox' && 'Your Inbox'}
                {activeView === 'reviews' && 'Review Requests'}
                {activeView === 'mentions' && 'Mentions'}
                {activeView === 'my-prs' && 'My Pull Requests'}
                {activeView === 'involved' && 'Involved Discussions'}
                {activeView === 'assigned' && 'Assigned to me'}
                {activeView === 'manage-repos' && 'Manage Repositories'}
                {activeView === 'graph' && 'Work Tree'}
              </h1>
              <p className="text-app-meta text-sm mt-1">
                {activeView === 'inbox' && 'Focus on what needs your attention right now.'}
                {activeView === 'reviews' && 'Pull requests where your review is requested.'}
                {activeView === 'mentions' && 'Conversations where you were mentioned.'}
                {activeView === 'my-prs' && 'Track the status of pull requests you opened.'}
                {activeView === 'involved' && 'Discussions you have participated in.'}
                {activeView === 'assigned' && 'Issues and pull requests assigned to you.'}
                {activeView === 'manage-repos' && 'Control which repositories show up in your inbox.'}
                {activeView === 'graph' && 'See all your repositories, PRs, issues, and checks at a glance.'}
              </p>
            </div>
            <button 
              onClick={fetchDashboard}
              className="px-4 py-2 bg-app-panel border border-app-border rounded-lg text-sm font-medium text-app-muted hover:text-app-text hover:border-app-muted shadow-sm transition-all flex items-center gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
            </button>
          </header>

          {loading && !data ? (
            <div className="flex flex-col items-center justify-center py-20 text-app-meta">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Fetching your action items...</p>
            </div>
          ) : activeView === 'graph' ? (
            <div className="w-full h-full overflow-x-auto pb-8">
              <div className="min-w-[600px]">
                <WorkTree data={data} mutedRepos={mutedRepos} onNodeClick={handleItemSelected} extractRepoName={extractRepoName} user={user} />
              </div>
            </div>
          ) : activeView === 'manage-repos' ? (
            <div className="space-y-12">
              <div className="bg-app-panel border border-app-border rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
                <div className="p-4 border-b border-app-border flex items-center gap-3">
                  <Search className="w-5 h-5 text-app-meta" />
                  <input
                    type="text"
                    placeholder="Search repositories to mute/unmute..."
                    value={repoSearchQuery}
                    onChange={(e) => setRepoSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none border-none text-app-text placeholder-app-meta focus:ring-0 text-sm"
                  />
                </div>
                <div className="divide-y divide-app-border overflow-y-auto">
                  {loadingRepos ? (
                    <div className="p-8 flex items-center justify-center text-app-meta gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Fetching your repositories...</span>
                    </div>
                  ) : (() => {
                    // Build merged repo list: API repos + dashboard repos
                    const repoInfoMap = new Map<string, { name: string; avatar: string; description: string; language: string; private: boolean }>();
                    
                    // Add API repos
                    allUserRepos.forEach(r => {
                      repoInfoMap.set(r.full_name, {
                        name: r.full_name,
                        avatar: r.owner_avatar || '',
                        description: r.description || '',
                        language: r.language || '',
                        private: r.private || false,
                      });
                    });
                    
                    // Add dashboard repos (may not be in API results if contributed via issues/PRs)
                    if (data) {
                      const allItems = [...data.reviewRequested, ...data.mentions, ...data.myPrs, ...data.myIssues, ...data.involved, ...data.assigned];
                      allItems.forEach(item => {
                        const repoName = extractRepoName(item.repository_url);
                        if (repoName && !repoInfoMap.has(repoName)) {
                          const owner = repoName.split('/')[0];
                          repoInfoMap.set(repoName, {
                            name: repoName,
                            avatar: `https://github.com/${owner}.png?size=32`,
                            description: '',
                            language: '',
                            private: false,
                          });
                        }
                      });
                    }
                    
                    // Add any previously muted repos
                    Object.keys(mutedRepos).forEach(repo => {
                      if (!repoInfoMap.has(repo)) {
                        const owner = repo.split('/')[0];
                        repoInfoMap.set(repo, {
                          name: repo,
                          avatar: `https://github.com/${owner}.png?size=32`,
                          description: '',
                          language: '',
                          private: false,
                        });
                      }
                    });

                    let repos = Array.from(repoInfoMap.values()).sort((a, b) => a.name.localeCompare(b.name));
                    
                    if (repoSearchQuery.trim()) {
                      const q = repoSearchQuery.toLowerCase();
                      repos = repos.filter(r => r.name.toLowerCase().includes(q));
                    }

                    if (repos.length === 0) {
                      return (
                        <div className="p-8 text-center text-app-meta text-sm">
                          No repositories found matching your search.
                        </div>
                      );
                    }

                    return repos.map((repo, i) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-app-base transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img src={repo.avatar} alt="" className="w-6 h-6 rounded-full shrink-0" loading="lazy" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-app-text truncate">{repo.name}</span>
                              {repo.private && <span className="text-[10px] px-1.5 py-0.5 rounded border border-app-border text-app-meta">Private</span>}
                            </div>
                            {repo.description && (
                              <p className="text-xs text-app-meta truncate mt-0.5">{repo.description}</p>
                            )}
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                          <input type="checkbox" className="sr-only peer" checked={!!mutedRepos[repo.name]} onChange={() => setMutedRepos(prev => ({...prev, [repo.name]: !prev[repo.name]}))} />
                          <div className="w-11 h-6 bg-app-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          <span className="ml-3 text-sm font-medium text-app-muted">Muted</span>
                        </label>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-12">
              {(activeView === 'inbox') && (
                <Section 
                  id="notifications"
                  title="Unread Notifications" 
                  icon={<Inbox className="w-5 h-5 text-blue-500" />} 
                  items={filterItems(data.notifications)} 
                  emptyMessage="You have no unread notifications. Inbox zero!"
                  extractRepoName={extractRepoName}
                  onItemSelected={handleItemSelected}
                  readItems={readItems}
                  onMarkDone={handleMarkDone}
                />
              )}
              {(activeView === 'reviews') && (
                <Section 
                  id="reviews"
                  title="Review Requests" 
                  icon={<GitPullRequest className="w-5 h-5 text-blue-500" />} 
                  items={filterItems(data.reviewRequested)} 
                  emptyMessage="You have no pending review requests. Great job!"
                  extractRepoName={extractRepoName}
                  onItemSelected={handleItemSelected}
                  readItems={readItems}
                  onMarkDone={handleMarkDone}
                />
              )}
              {(activeView === 'mentions') && (
                <Section 
                  id="mentions"
                  title="Mentions" 
                  icon={<AtSign className="w-5 h-5 text-orange-500" />} 
                  items={filterItems(data.mentions)} 
                  emptyMessage="No unaddressed mentions."
                  extractRepoName={extractRepoName}
                  onItemSelected={handleItemSelected}
                  readItems={readItems}
                  onMarkDone={handleMarkDone}
                />
              )}
              {(activeView === 'my-prs') && (
                <Section 
                  id="my-prs"
                  title="Your Pull Requests" 
                  icon={<GitMerge className="w-5 h-5 text-purple-500" />} 
                  items={filterItems(data.myPrs, true)} 
                  emptyMessage="You don't have any pull requests."
                  extractRepoName={extractRepoName}
                  onItemSelected={handleItemSelected}
                  readItems={readItems}
                  onMarkDone={handleMarkDone}
                />
              )}
              {(activeView === 'my-issues') && (
                <Section 
                  id="my-issues"
                  title="Your Issues" 
                  icon={<CircleDot className="w-5 h-5 text-amber-500" />} 
                  items={filterItems(data.myIssues, true)} 
                  emptyMessage="You haven't created any issues."
                  extractRepoName={extractRepoName}
                  onItemSelected={handleItemSelected}
                  readItems={readItems}
                  onMarkDone={handleMarkDone}
                />
              )}
              {(activeView === 'involved') && (
                <Section 
                  id="involved"
                  title="Involved Discussions" 
                  icon={<MessageCircle className="w-5 h-5 text-emerald-500" />} 
                  items={filterItems(data.involved)} 
                  emptyMessage="You're all caught up on discussions."
                  extractRepoName={extractRepoName}
                  onItemSelected={handleItemSelected}
                  readItems={readItems}
                  onMarkDone={handleMarkDone}
                />
              )}
              {(activeView === 'assigned') && (
                <Section 
                  id="assigned"
                  title="Assigned to me" 
                  icon={<ClipboardList className="w-5 h-5 text-teal-500" />} 
                  items={filterItems(data.assigned)} 
                  emptyMessage="You have no assigned issues."
                  extractRepoName={extractRepoName}
                  onItemSelected={handleItemSelected}
                  readItems={readItems}
                  onMarkDone={handleMarkDone}
                />
              )}
            </div>
          ) : null}
            </motion.div>
          )}
        </div>
      </main>
      <RightSidebar 
        initialActiveWork={rightSidebarActiveWork}
        initialBlockers={rightSidebarBlockers}
        initialWaitingOn={rightSidebarWaitingOn}
        initialTimeline={rightSidebarTimeline}
      />
      <InterviewShowcaseModal 
        isOpen={isInterviewModalOpen} 
        onClose={() => setIsInterviewModalOpen(false)} 
      />
      <PRReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        pr={reviewModalPr}
        onReviewSubmitted={() => {
          fetchDashboard();
        }}
      />
    </div>
  );
}

function Section({ id, title, icon, items, emptyMessage, extractRepoName, onItemSelected, readItems, onMarkDone }: { id: string, title: string, icon: React.ReactNode, items: GitHubIssue[], emptyMessage: string, extractRepoName: (url: string) => string, onItemSelected: (item: GitHubIssue) => void, readItems: Set<number>, onMarkDone: (id: number, updatedAt: string) => void }) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="[&>svg]:w-7 [&>svg]:h-7">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-app-text tracking-tight">{title}</h2>
        <span className="bg-app-border text-app-muted text-sm font-semibold px-3 py-1 rounded-full">{items.length}</span>
      </div>
      
      {items.length === 0 ? (
        <div className="bg-app-panel border border-app-border rounded-xl p-8 text-center shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-app-muted mx-auto mb-3" />
          <p className="text-app-muted">{emptyMessage}</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-app-panel border border-app-border rounded-xl shadow-sm flex flex-col"
        >
          <AnimatePresence initial={false}>
            {items.map((item) => {
              const isRead = readItems.has(item.id);
              return (
              <motion.button 
                key={item.id} 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => onItemSelected(item)}
                className={`block w-full overflow-hidden text-left hover:bg-app-base transition-colors group border-b border-app-border last:border-b-0 ${!isRead ? 'bg-[#2563eb]/5' : ''}`}
              >
                <div className="p-4 sm:px-6">
                  <div className="flex items-start gap-4">
                    <Image src={item.user.avatar_url} alt={item.user.login} width={32} height={32} className="w-8 h-8 rounded-full bg-app-sidebar shrink-0 mt-0.5" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                        <div className="flex items-center gap-2 pr-4 min-w-0 flex-1">
                          {!isRead && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                          <h3 className={`text-[15px] truncate group-hover:text-blue-500 transition-colors ${isRead ? 'font-medium text-app-muted' : 'font-bold text-app-text'}`}>
                            {item.title}
                          </h3>
                        </div>
                        <span className="text-xs text-app-meta whitespace-nowrap shrink-0">
                          {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-app-muted">
                        <span className="font-medium text-app-text">{extractRepoName(item.repository_url)}</span>
                        <span className="text-app-muted">•</span>
                        <span>#{item.number}</span>
                        <span className="text-app-muted">•</span>
                        <span>by {item.user.login}</span>
                      </div>
                      {item.related_issue && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <div className="bg-app-border text-app-muted px-2 py-0.5 rounded flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Fixes #{item.related_issue.number}</span>
                          </div>
                          <a href={item.related_issue.html_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-app-meta hover:text-app-muted transition-colors truncate">
                            {item.related_issue.title}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onMarkDone(item.id, item.updated_at); }}
                        className="p-1.5 text-app-muted hover:text-emerald-400 rounded hover:bg-slate-700/50 transition-colors hidden sm:block"
                        title="Mark as done"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <a 
                        href={item.html_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-app-muted hover:text-white rounded hover:bg-slate-700/50 transition-colors hidden sm:block"
                        title="Open in GitHub"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
