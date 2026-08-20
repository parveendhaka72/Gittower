# 🎓 GitTower: Engineering Interview Preparation Guide & Rubric Map

This guide is your **cheat sheet** for your interview. It maps every mandatory evaluation point directly to the code files, functions, and key talking points in GitTower.

---

## 📌 Rubric Checklist & Codebase Map

| Rubric Item | Points | Key File(s) | Function / Component |
| :--- | :--- | :--- | :--- |
| **LLM API integration** | 0.2 pts | [`lib/ai/gemini.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/gemini.ts) | `analyzeIssueWithGemini()`, `reviewPRWithGemini()` |
| **Prompt engineering** | 0.2 pts | [`lib/ai/prompts.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/prompts.ts) | `SYSTEM_PROMPTS`, `buildIssueTriagePrompt()` (Role, Few-shot, Chain-of-Thought) |
| **Structured outputs** | 0.2 pts | [`lib/ai/schemas.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/schemas.ts) | `ISSUE_ANALYSIS_SCHEMA`, `PR_REVIEW_SCHEMA` (`responseSchema`) |
| **HTTP status codes used correctly** | 0.2 pts | [`lib/errors/withErrorHandler.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/errors/withErrorHandler.ts) | `withErrorHandler()`, `jsonResponse()` (`200`, `201`, `400`, `401`, `403`, `404`, `422`, `429`, `500`) |
| **Middleware** | 0.2 pts | [`middleware.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/middleware.ts) | `middleware()` (Edge Auth Guard, Rate Limiter closure, Security Headers) |
| **Problem modeling** | 0.2 pts | [`lib/db/models/AttentionNote.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/models/AttentionNote.ts), [`lib/ai/schemas.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/schemas.ts) | Attention Triage domain models, Urgency levels, Priority buckets |
| **RESTful endpoint design** | 0.2 pts | [`app/api/notes/route.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/notes/route.ts), [`app/api/ai/analyze-issue/route.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/ai/analyze-issue/route.ts) | Resource-oriented URIs, HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`) |
| **Server-side error handling** | 0.2 pts | [`lib/errors/AppError.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/errors/AppError.ts), [`lib/errors/withErrorHandler.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/errors/withErrorHandler.ts) | `AppError` subclasses, uniform error envelopes, non-leaking stack traces |
| **System design basics** | 0.2 pts | [`components/InterviewShowcaseModal.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/components/InterviewShowcaseModal.tsx) | Multi-tier architecture: Client $\leftrightarrow$ Middleware $\leftrightarrow$ REST APIs $\leftrightarrow$ AI / GitHub $\leftrightarrow$ Dual DBs |
| **Environment variables & secrets** | 0.2 pts | [`lib/config/env.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/config/env.ts), [`.env.example`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/.env.example) | `validateEnvironment()`, typed `AppConfig`, startup diagnostic checks |
| **Git workflow** | 0.3 pts | [`.gitignore`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/.gitignore), [`README.md`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/README.md) | Branching strategy, PR checks validation, semver commits |
| **Async data fetching from API** | 0.2 pts | [`app/page.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/page.tsx), [`components/InterviewShowcaseModal.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/components/InterviewShowcaseModal.tsx) | AbortControllers, debounced query fetchers, concurrent `Promise.all` |
| **Client-side routing** | 0.2 pts | [`app/page.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/page.tsx) | Next.js App Router query params (`?view=inbox&issue=repo/123`), `popstate` sync |
| **JavaScript — async/await** | 0.1 pts | [`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts) | `runAsyncBenchmark()` (Sequential vs parallel execution & error handling) |
| **JavaScript — Closures** | 0.1 pts | [`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts), [`middleware.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/middleware.ts) | `createMemoizer()`, `createRateLimiter()` (Private state encapsulation) |
| **JavaScript — Event loop** | 0.1 pts | [`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts) | `runEventLoopDemonstration()` (Call Stack $\rightarrow$ Microtasks $\rightarrow$ Macrotasks) |
| **JavaScript — Hoisting** | 0.1 pts | [`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts) | `demonstrateHoisting()` (`var` vs `let`/`const` TDZ vs function declaration) |
| **JavaScript — Promises vs callbacks** | 0.1 pts | [`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts) | `promisify()`, `comparePromisesVsCallbacks()` |
| **React component composition** | 0.2 pts | [`components/AIInsightCard.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/components/AIInsightCard.tsx), [`components/InterviewShowcaseModal.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/components/InterviewShowcaseModal.tsx) | Slotted layouts, decoupled presentational & container components |
| **Side effects with useEffect** | 0.2 pts | [`app/page.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/page.tsx), [`components/InterviewShowcaseModal.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/components/InterviewShowcaseModal.tsx) | Polling intervals with cleanup, popstate event listeners, dependency arrays |
| **State management with useState** | 0.2 pts | [`app/page.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/page.tsx), [`components/RightSidebar.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/components/RightSidebar.tsx) | Functional updates, optimistic UI states, localStorage synchronization |
| **CRUD operations (Mongo)** | 0.2 pts | [`app/api/notes/route.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/notes/route.ts), [`app/api/notes/[id]/route.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/notes/[id]/route.ts) | Create (POST), Read (GET), Update (PATCH), Delete (DELETE) |
| **Schema modeling (Mongo)** | 0.2 pts | [`lib/db/models/AttentionNote.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/models/AttentionNote.ts) | Document schema with typed fields, priority tags, and indexing |
| **Relational schema design (PK/FK)** | 0.2 pts | [`lib/db/postgres.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/postgres.ts) | `users`, `repositories`, `pull_requests`, `review_assignments` with PKs & FKs |
| **SQL JOINs (Postgres)** | 0.2 pts | [`lib/db/sql-queries.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/sql-queries.ts), [`app/api/analytics/bottlenecks/route.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/analytics/bottlenecks/route.ts) | `INNER JOIN`, `LEFT JOIN`, and `AGGREGATE JOIN` (GROUP BY, AVG, COUNT) |

---

## 🎤 Interview Talking Points & Demo Walkthrough

### 1. AI Application Engineering
* **Talking Point**: "In [`lib/ai/gemini.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/gemini.ts), we integrate Google's `@google/genai` SDK using Gemini 2.0 Flash. We use **Prompt Engineering** in [`lib/ai/prompts.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/prompts.ts) with role-based system prompts, few-shot examples, and chain-of-thought reasoning to extract attention urgency and action items. We enforce **strict JSON schemas** via `responseSchema` so the frontend reliably receives typed fields."
* **Live Demo**: Open the **Interview Showcase** modal $\rightarrow$ Tab 1: "AI App Engineering" $\rightarrow$ Click **"Analyze with Gemini LLM"**.

### 2. Backend & System Design
* **Talking Point**: "Our API layer in Next.js App Router enforces strict REST conventions with uniform error envelopes and HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `422 Validation Error`, `500 Internal Server Error`) wrapped by the [`withErrorHandler`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/errors/withErrorHandler.ts) Higher-Order Function. Our [`middleware.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/middleware.ts) runs at the edge to inject security headers, trace request timing, and implement a closure-based token bucket rate limiter."
* **Live Demo**: Open **Interview Showcase** $\rightarrow$ Tab 5: "System Architecture" to display the multi-tier diagram and standard error envelopes.

### 3. Databases: NoSQL (MongoDB) vs Relational SQL (PostgreSQL)
* **Talking Point**: "We use a polyglot persistence design:
  1. **MongoDB (NoSQL)** in [`lib/db/models/AttentionNote.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/models/AttentionNote.ts) for developer notes, dynamic priority tags (`P0-P3`), and AI triage summaries. It supports full CRUD over REST (`GET /api/notes`, `POST /api/notes` returning 201, `PATCH` and `DELETE /api/notes/[id]`).
  2. **PostgreSQL (SQL)** in [`lib/db/postgres.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/postgres.ts) for relational modeling with Primary Keys and Foreign Key constraints (`users` $\rightarrow$ `repositories` $\rightarrow$ `pull_requests` $\rightarrow$ `review_assignments`). In [`lib/db/sql-queries.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/sql-queries.ts), we demonstrate `INNER JOIN`, `LEFT JOIN` (preserving unblocked repos), and `AGGREGATE JOIN` to compute team review turnaround bottlenecks."
* **Live Demo**: Open **Interview Showcase** $\rightarrow$ Tab 2 (MongoDB live CRUD) and Tab 3 (SQL JOINs live table).

### 4. JavaScript Engine & React Mastery
* **Talking Point**: "In [`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts), we implement direct demonstrations of:
  * **Event Loop**: Tracing execution order of Synchronous Call Stack $\rightarrow$ Microtasks (`queueMicrotask`, `Promise.then`) $\rightarrow$ Macrotasks (`setTimeout`).
  * **Closures**: Encapsulating private cache state in `createMemoizer()` and rate limiting tokens.
  * **Hoisting**: Demonstrating function declaration hoisting vs `var` (undefined) vs `let`/`const` Temporal Dead Zone.
  * **Async/Await**: Benchmarking `Promise.all` parallel concurrent execution vs sequential blocking awaits."
* **Live Demo**: Open **Interview Showcase** $\rightarrow$ Tab 4: "JavaScript Mastery".
