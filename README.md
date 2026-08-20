# GitTower

**GitTower is a GitHub workspace that helps developers manage work, not repositories.**

GitHub remains the source of truth.  
GitTower is where developers process everything that needs their attention.

---

## Why GitTower exists

GitHub is great at storing code, but daily developer work is attention management:

- What needs my attention right now?
- Which PR is waiting on me?
- Which maintainer replied?
- Which CI failed?
- Which PR is ready to merge?
- Which discussion still needs a response?

GitTower centralizes that workflow into one decision-first workspace.

---

## Philosophy

- **GitHub organizes code. GitTower organizes work.**
- **GitHub stores information. GitTower prioritizes attention.**
- GitHub answers: **“What happened?”**
- GitTower answers: **“What should I do next?”**

---

## What GitTower is

- A workspace
- An attention manager
- A work queue
- A collaboration dashboard
- A productivity layer on top of GitHub

## What GitTower is not

- Not a GitHub replacement
- Not another Git client
- Not another IDE
- Not a code editor
- Not a notification app
- Not another project manager

---

## Core principle

Everything shown in GitTower must answer:

> **Why am I looking at this?**

Every item exists because somebody or something is waiting.

Examples:

- ❌ Notification → ✅ Reply required
- ❌ CI passed → ✅ Ready to merge
- ❌ Mention → ✅ Maintainer asked a question

---

## Attention-first mental model

### GitHub structure
Repository → Pull Request → Comments → CI → Issues

### GitTower structure
Needs Me → Waiting → Following → Done

Primary organization is by **attention**, not by repository.

---

## Typical workflow

Open GitTower and immediately see actionable work:

- Review requests
- Mentions and replies
- Merge-ready PRs
- Failed checks
- Active discussions

Instead of opening many tabs, GitTower gives one focused queue.

---

## Current implementation (this repository)

This codebase is a **Next.js 15 + React 19** application that implements the GitTower experience on top of GitHub OAuth and GitHub APIs.

### Implemented capabilities

- GitHub OAuth sign-in flow
- Unified inbox views:
  - Review Requests
  - Mentions
  - My Pull Requests
  - Involved Discussions
  - Assigned to Me
- Work Tree view for repository → PR/Issue hierarchy with status and CI indicators
- PR/Issue detail pane with timeline and rich markdown rendering
- In-app actions:
  - Comment
  - Close/Reopen issues
  - Merge pull requests
- Repository muting controls for inbox focus
- Periodic polling to refresh dashboard/timeline/check status

---

## 📚 Project Architecture & Engineering Documentation

GitTower is fully documented across all standard engineering artifacts:

| Document | Description | Direct Link |
| :--- | :--- | :--- |
| **📄 Product Requirements Document (PRD)** | Problem statement, user personas, functional/non-functional specs, attention-first mental model, KPIs | [docs/PRD.md](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/docs/PRD.md) |
| **🏛️ High-Level Design (HLD)** | Multi-tier topology, edge middleware, polyglot persistence, security architecture, resilience strategies | [docs/HLD.md](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/docs/HLD.md) |
| **📐 Low-Level Design (LLD)** | Class diagrams, data models, REST endpoint specs, sequence flows, V8 event loop/closures algorithms | [docs/LLD.md](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/docs/LLD.md) |
| **🎓 Interview Rubric & Guide** | Master cheat sheet mapping all 25 evaluation points to exact files, code lines, and live demo steps | [docs/INTERVIEW_GUIDE.md](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/docs/INTERVIEW_GUIDE.md) |

---

## Tech stack

- **Framework:** Next.js 15 (App Router)
- **UI & Animation:** React 19, Tailwind CSS v4, Motion
- **AI Intelligence:** Google Gemini 2.0/2.5 Flash via `@google/genai` (Structured JSON outputs)
- **Databases:** MongoDB (NoSQL Document Store) & PostgreSQL (Relational SQL with PK/FK & JOINs)
- **Icons & Markdown:** lucide-react, react-markdown + remark/rehype plugins
- **Date Formatting:** date-fns
- **Language & Runtime:** TypeScript (Strict), Node.js, V8 Engine

---

## Project structure

```text
app/
  page.tsx                     # Main authenticated workspace UI
  api/auth/*                   # GitHub OAuth helpers and session status
  api/github/*                 # GitHub proxy routes (dashboard, checks, issue, timeline, actions, etc.)
  api/ai/*                     # Gemini LLM AI Triage & PR Review endpoints
  api/notes/*                  # MongoDB NoSQL REST CRUD endpoints (GET, POST 201, PATCH, DELETE)
  api/analytics/*              # PostgreSQL Relational SQL JOINs analytics endpoints
  api/interview/*              # V8 Event Loop & Closures benchmark endpoint
components/
  AIInsightCard.tsx            # Slotted AI triage presentation component
  InterviewShowcaseModal.tsx   # Live interactive 5-tab showcase panel
  LandingPage.tsx              # Marketing/login entry page
  WorkTree.tsx                 # Attention tree UI
  RightSidebar.tsx             # Live Activity Center (Active Work, Blockers, Timeline)
lib/
  ai/                          # Gemini client, prompt engineering, structured JSON schemas
  config/                      # Strict environment variable schema & validation
  db/                          # MongoDB & PostgreSQL clients, models, and SQL queries
  errors/                      # Custom AppError hierarchy & withErrorHandler HOF
  js-concepts/                 # JavaScript core concepts (Event Loop, Closures, Hoisting, Async/Await)
middleware.ts                  # Edge middleware (Auth guard, Token bucket rate limiting, Security headers)
docs/                          # PRD, HLD, LLD, and Interview Preparation Guide
```

---

## Environment variables

Create a `.env.local` using `.env.example` as reference:

- `GITHUB_CLIENT_ID` – GitHub OAuth App client ID
- `GITHUB_CLIENT_SECRET` – GitHub OAuth App client secret
- `APP_URL` – Base URL of the app (used for OAuth callback construction)
- `GEMINI_API_KEY` – Present in template for future AI-related capabilities

---

## Local development

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

### Useful scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

## GitHub OAuth setup

Create a GitHub OAuth App and configure callback URL as:

```text
http://localhost:3000/api/auth/callback
```

For deployed environments, set `APP_URL` and use:

```text
<APP_URL>/api/auth/callback
```

---

## API routes (high level)

- `GET /api/auth/url` – Build GitHub OAuth authorization URL
- `GET /api/auth/callback` – Exchange code, set auth cookie
- `GET /api/auth/status` – Validate auth/session
- `POST /api/auth/logout` – Clear auth cookie
- `GET /api/github/dashboard` – Fetch attention buckets (reviews, mentions, assigned, etc.)
- `GET /api/github/issue` – Fetch issue/PR by number
- `GET /api/github/timeline` – Fetch issue/PR timeline
- `GET /api/github/checks` – Fetch PR checks and mergeability status
- `GET /api/github/repos` – Fetch user/collaborator repositories
- `GET /api/github/contributors` – Fetch repository contributors
- `GET /api/github/search-issues` – Search issues/PRs in a repo
- `POST /api/github/action` – Comment, close/reopen, merge

---

## Target users

### Primary

- Open-source contributors
- Maintainers
- Senior engineers
- Developers active across multiple repositories

### Secondary

- Engineering teams
- Indie developers

---

## Success metric

GitTower succeeds when developers stop asking:

> “Where do I need to go?”

and immediately know:

> “What should I do next?”

---

## Elevator pitch

GitTower is a workspace built on top of GitHub that organizes pull requests, reviews, issues, discussions, CI, and notifications into one attention-first workflow. Instead of jumping between repositories and dozens of tabs to understand what changed, developers open GitTower and instantly see what needs their attention, what’s waiting on others, and what’s ready to ship.

