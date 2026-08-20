# 🏛️ High-Level Design (HLD) — GitTower

| Property | Details |
| :--- | :--- |
| **System Name** | **GitTower Architecture** |
| **Architecture Pattern** | Layered Multi-Tier with Edge Gateway & Polyglot Persistence |
| **Document Version** | 1.0.0 |
| **Status** | Approved / Production-Ready |
| **Hosting Platform** | Next.js App Router (Node.js runtime + Edge Middleware) |

---

## 1. Architectural Overview & Design Goals

GitTower is built as a **high-throughput, low-latency developer command center**. It aggregates external GitHub state, enriches it with generative AI analysis, and persists developer attention notes and analytics using a dual NoSQL/Relational data store.

### Key Architectural Tenets:
1. **Zero Cold-Start Latency**: Edge middleware validates tokens and enforces rate limits before hitting compute.
2. **Deterministic AI**: Enforce strict JSON Schema validation on LLM responses with offline heuristic failover.
3. **Polyglot Persistence**: 
   * **MongoDB (NoSQL)** for semi-structured attention documents and flexible triage tagging.
   * **PostgreSQL (Relational SQL)** for normalized review assignments, PR dependencies, and complex aggregate JOINs.
4. **Resilience & Graceful Degradation**: Built-in in-memory fallback engines for MongoDB, PostgreSQL, and Gemini LLM ensuring zero-downtime operation during network partitions or missing credentials.

---

## 2. Multi-Tier System Topology

```mermaid
graph TB
    subgraph ClientLayer ["1. Client Tier (Browser)"]
        UI["React 19 Next.js UI<br/>(Tailwind v4, Motion)"]
        Cache["LocalStorage Cache<br/>(Read items, Done state)"]
        UI <--> Cache
    end

    subgraph EdgeLayer ["2. Edge Middleware Tier"]
        MW["Next.js Edge Middleware<br/>(middleware.ts)"]
        RateLimit["Closure Token Bucket<br/>Rate Limiter (100 req/min)"]
        SecHeaders["Security Headers<br/>(CSP, X-Frame, X-XSS)"]
        MW --> RateLimit
        MW --> SecHeaders
    end

    subgraph ServerLayer ["3. Backend API Gateway Tier"]
        HOC["withErrorHandler (HOF Wrapper)"]
        
        subgraph RouteHandlers ["REST Route Handlers"]
            AuthRoutes["/api/auth/*"]
            GHRoutes["/api/github/*"]
            AIRoutes["/api/ai/*"]
            NoteRoutes["/api/notes/*"]
            AnalyticsRoutes["/api/analytics/*"]
            JSRoutes["/api/interview/*"]
        end
        
        HOC --> RouteHandlers
    end

    subgraph IntegrationLayer ["4. External Integration Tier"]
        GH_API["GitHub REST API v3<br/>(Octokit / Fetch)"]
        Gemini_API["Google Gemini 2.0 Flash<br/>(@google/genai SDK)"]
    end

    subgraph DataLayer ["5. Persistence Tier (Polyglot)"]
        MongoDB[("MongoDB (NoSQL)<br/>AttentionNotes & Tags")]
        Postgres[("PostgreSQL (Relational)<br/>PK/FK Schema & JOINs")]
    end

    UI -->|HTTPS / REST| MW
    MW -->|Authorized Requests| HOC
    
    GHRoutes -->|Bearer OAuth Token| GH_API
    AIRoutes -->|GEMINI_API_KEY + JSON Schema| Gemini_API
    NoteRoutes -->|CRUD Queries| MongoDB
    AnalyticsRoutes -->|SQL JOINs & GROUP BY| Postgres
```

---

## 3. Subsystem Breakdown

### 3.1 Tier 1: Client Application
* **Framework**: Next.js 15 App Router (`'use client'` single-page dynamic routing with query parameter synchronization).
* **State Management**:
  * React `useState` for local component UI state.
  * React `useEffect` for side-effects (URL `popstate` listeners, periodic CI/CD check polling, click-outside closures).
  * Optimistic UI updates for comment submission and issue status toggling.
* **Component Composition**: Decoupled slotted components ([`AIInsightCard.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/components/AIInsightCard.tsx), [`InterviewShowcaseModal.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/components/InterviewShowcaseModal.tsx), [`WorkTree.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/components/WorkTree.tsx), [`RightSidebar.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/components/RightSidebar.tsx)).

### 3.2 Tier 2: Edge Middleware Layer
* **Location**: [`middleware.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/middleware.ts) running on the V8 Edge Runtime.
* **Token Bucket Rate Limiter**:
  * Implemented using JavaScript **closures** to encapsulate an in-memory token map.
  * Allows a maximum burst of 100 requests per IP with a refill rate of 1 token every 600ms.
* **Route Protection**:
  * Intercepts `/api/github/*` and `/api/notes/*` to verify session cookies (`gittower_github_token`).
* **Security & Observability Headers**:
  * Injects `X-Response-Time`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

### 3.3 Tier 3: API Gateway & Error Handling
* **Higher-Order Function**: [`withErrorHandler`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/errors/withErrorHandler.ts) wraps all route handlers with:
  1. Standardized JSON response envelope: `{ success, data, error: { code, message, statusCode, details }, meta: { timestamp, path } }`.
  2. Typed error catching matching subclasses of [`AppError`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/errors/AppError.ts) (`BadRequestError` [400], `UnauthorizedError` [401], `ForbiddenError` [403], `NotFoundError` [404], `ValidationError` [422], `TooManyRequestsError` [429], `InternalServerError` [500]).
  3. Latency instrumentation header (`X-Response-Time`).

### 3.4 Tier 4: External Integrations
* **Google Gemini API**:
  * Connected via `@google/genai` SDK in [`lib/ai/gemini.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/gemini.ts).
  * System prompts with Chain-of-Thought guidelines in [`lib/ai/prompts.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/prompts.ts).
  * Strict schema enforcement via `responseSchema` in [`lib/ai/schemas.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/schemas.ts).
* **GitHub REST API**:
  * Uses concurrent async fetching (`Promise.all`) across 7 attention endpoints: notifications, review requests, user mentions, authored PRs, authored issues, involved threads, and assigned items.

### 3.5 Tier 5: Polyglot Persistence Layer
```mermaid
erDiagram
    USERS ||--o{ REPOSITORIES : owns
    USERS ||--o{ PULL_REQUESTS : authors
    USERS ||--o{ REVIEW_ASSIGNMENTS : assigned_to
    REPOSITORIES ||--o{ PULL_REQUESTS : contains
    REPOSITORIES ||--o{ WORKFLOW_BLOCKERS : has
    PULL_REQUESTS ||--o{ REVIEW_ASSIGNMENTS : requires

    USERS {
        string id PK
        string github_login
        string name
        string avatar_url
    }
    REPOSITORIES {
        string id PK
        string full_name
        string owner_id FK
        boolean is_private
    }
    PULL_REQUESTS {
        string id PK
        string repo_id FK
        int pr_number
        string title
        string author_id FK
        string state
    }
    REVIEW_ASSIGNMENTS {
        string id PK
        string pr_id FK
        string reviewer_id FK
        string status
        int turnaround_time_hours
    }
    WORKFLOW_BLOCKERS {
        string id PK
        string repo_id FK
        string name
        string failure_reason
    }
```

* **MongoDB (NoSQL Document Store)**:
  * Model: `AttentionNote` (`_id`, `repoFullName`, `itemNumber`, `itemType`, `authorLogin`, `title`, `notes`, `tags`, `priority`, `aiTriageSummary`, `isResolved`).
  * Indexing: Compound index on `{ repoFullName: 1, itemNumber: 1 }` for $O(1)$ lookups.
* **PostgreSQL (Relational Store)**:
  * Normalized tables with Primary Key (PK) and Foreign Key (FK) constraints.
  * SQL JOIN queries (`INNER JOIN`, `LEFT JOIN`, `AGGREGATE JOIN`) for team bottleneck computation.

---

## 4. Security Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as Developer
    participant Client as GitTower UI
    participant Server as GitTower API
    participant GitHub as GitHub OAuth Server

    User->>Client: Clicks "Connect with GitHub"
    Client->>Server: GET /api/auth/url
    Server-->>Client: Returns OAuth authorize URL + CSRF state
    Client->>GitHub: Opens OAuth popup window
    User->>GitHub: Approves permissions (repo, read:user)
    GitHub-->>Server: Redirects to /api/auth/callback?code=XYZ&state=...
    Server->>GitHub: Exchanges code for Access Token
    GitHub-->>Server: Returns gh_token_xxx
    Server-->>Client: Sets HttpOnly Secure Cookie (gittower_github_token)
    Server-->>Client: Sends postMessage("AUTH_SUCCESS") to close popup
    Client->>Server: GET /api/auth/status (Cookie verified)
    Server-->>Client: Returns User Profile (200 OK)
```

---

## 5. Resilience & Fault Tolerance Strategy

| Failure Scenario | Mitigation Mechanism | User Experience |
| :--- | :--- | :--- |
| **Gemini API Down / No Key** | Offline Heuristic Engine in [`lib/ai/gemini.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/gemini.ts) calculates urgency based on keywords, label weights, and activity. | Seamless instant triage card generated without user-facing error. |
| **MongoDB Disconnected** | In-memory document store fallback in [`lib/db/mongodb.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/mongodb.ts) pre-seeded with sample notes. | Full CRUD remains interactive for demo/testing without crash. |
| **PostgreSQL Disconnected** | In-memory relational engine in [`lib/db/postgres.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/postgres.ts) with full join/aggregation logic. | Analytics queries (`INNER JOIN`, `LEFT JOIN`) execute reliably. |
| **GitHub Rate Limit (429)** | Edge middleware & route handler return standard `429 Too Many Requests` with `Retry-After` header. | UI shows clear cooldown timer. |
| **Network Flakiness** | Global `withErrorHandler` catches unhandled exceptions and returns standardized `500` JSON envelopes. | Error boundary prevents white-screen crash. |
