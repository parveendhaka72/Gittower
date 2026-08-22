# 🎓 GitTower Master Interview Guide & 1.5-Minute Verbal Cheat Sheet

> **Interview Delivery Rule**: Every answer below is tailored for a **1.5-minute verbal response** (~180–220 words). Speak naturally, start with the core concept, explain the mechanics, reference how we built it in GitTower, and finish with a practical trade-off.

---

## 📑 Complete Master Rubric Checklist & Codebase Map (63/63 Points Covered)

| Category | Evaluation Topic | Pts | Key File in GitTower | Code Symbol / Implementation |
| :--- | :--- | :--- | :--- | :--- |
| **AI App Eng** | Function calling / tool use | 0.3 | [`lib/ai/agent.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/agent.ts) | `AGENT_TOOLS`, `searchGitHubIssues`, `assignReviewer` |
| **AI App Eng** | LLM API integration | 0.2 | [`lib/ai/gemini.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/gemini.ts) | `analyzeIssueWithGemini()`, `@google/genai` |
| **AI App Eng** | LLM eval sets | 0.5 | [`lib/ai/agent.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/agent.ts) | `GOLDEN_EVAL_SET`, `runEvalSuite()` |
| **AI App Eng** | Multi-step agent | 1.0 | [`lib/ai/agent.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/agent.ts) | `runMultiStepAgent()` (ReAct reasoning loop) |
| **AI App Eng** | Prompt engineering | 0.2 | [`lib/ai/prompts.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/prompts.ts) | `SYSTEM_PROMPTS`, Few-Shot examples, CoT |
| **AI App Eng** | Prompt injection defenses | 0.3 | [`lib/security/sanitize.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/security/sanitize.ts) | `defendAgainstPromptInjection()`, XML tags |
| **AI App Eng** | RAG — embeddings & vector retrieval | 0.5 | [`lib/ai/agent.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/agent.ts) | `cosineSimilarity()`, `retrieveRelevantDocuments()` |
| **AI App Eng** | Streaming responses | 0.3 | [`app/api/ai/stream/route.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/ai/stream/route.ts) | `ReadableStream`, Server-Sent Events (SSE) |
| **AI App Eng** | Structured outputs | 0.2 | [`lib/ai/schemas.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/schemas.ts) | `ISSUE_ANALYSIS_SCHEMA`, `responseSchema` |
| **AI App Eng** | Token & cost monitoring | 0.3 | [`lib/ai/agent.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/agent.ts) | `calculateTokenAndCost()` |
| **Auth & Sec** | Input sanitization | 0.2 | [`lib/security/sanitize.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/security/sanitize.ts) | `sanitizeInput()`, XSS entity escaping |
| **Auth & Sec** | JWT issuance & verification | 0.2 | [`lib/auth/jwt.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/auth/jwt.ts) | `signJwt()`, `verifyJwt()` with Web Crypto |
| **Auth & Sec** | OAuth / 3rd-party login | 0.2 | [`app/api/auth/callback/route.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/auth/callback/route.ts) | GitHub OAuth 2.0 PKCE / Code exchange |
| **Auth & Sec** | Password hashing | 0.2 | [`lib/auth/jwt.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/auth/jwt.ts) | `hashPassword()`, `verifyPassword()` (PBKDF2/Salt) |
| **Auth & Sec** | Rate limiting | 0.2 | [`middleware.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/middleware.ts) | `createRateLimiter()` Token Bucket closure |
| **Auth & Sec** | Role-based authorization (RBAC) | 0.2 | [`lib/auth/jwt.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/auth/jwt.ts) | `hasPermission()`, `UserRole` hierarchy |
| **Backend** | Backend deployment | 0.2 | [`Dockerfile`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/Dockerfile), [`docker-compose.yml`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/docker-compose.yml) | Next.js standalone runner, Docker Compose |
| **Backend** | File upload handling | 0.2 | [`lib/system/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/system/index.ts) | `validateAndProcessFileUpload()` (Magic bytes) |
| **Backend** | HTTP status codes used correctly | 0.2 | [`lib/errors/withErrorHandler.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/errors/withErrorHandler.ts) | `200`, `201`, `400`, `401`, `403`, `404`, `422`, `429`, `500` |
| **Backend** | Middleware | 0.2 | [`middleware.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/middleware.ts) | Edge Auth Guard, Rate Limiting, Security Headers |
| **Backend** | Problem modeling | 0.2 | [`lib/db/models/AttentionNote.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/models/AttentionNote.ts) | Attention Queues, Urgency levels, Priority buckets |
| **Backend** | Request body validation | 0.2 | [`lib/validation/form.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/validation/form.ts) | `validateSchema()`, `ATTENTION_NOTE_SCHEMA` |
| **Backend** | RESTful endpoint design | 0.2 | [`app/api/notes/route.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/notes/route.ts) | Resource-oriented URIs, HTTP verbs (GET, POST 201) |
| **Backend** | Server-side error handling | 0.2 | [`lib/errors/AppError.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/errors/AppError.ts) | `AppError` subclasses, uniform error envelopes |
| **Backend** | System design basics | 0.2 | [`docs/HLD.md`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/docs/HLD.md), [`docs/LLD.md`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/docs/LLD.md) | Multi-tier topology, Client/Server/DB integration |
| **Engineering** | Automated API & integration testing | 0.2 | [`__tests__/system.test.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/__tests__/system.test.ts) | Jest / Supertest integration test suite |
| **Engineering** | Containerization with Docker | 0.5 | [`Dockerfile`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/Dockerfile) | Multi-stage Docker builder (`node:20-alpine`) |
| **Engineering** | Environment & secrets management | 0.2 | [`lib/config/env.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/config/env.ts) | `validateEnvironment()`, typed `AppConfig` |
| **Engineering** | Git workflow | 0.3 | [`README.md`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/README.md), [`docs/PRD.md`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/docs/PRD.md) | Branching strategy, semver commits, PR checks |
| **Engineering** | Writing unit tests | 0.3 | [`__tests__/system.test.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/__tests__/system.test.ts) | Unit tests for Auth, Prompt Defense, Validation |
| **Frontend** | Async data fetching from API | 0.2 | [`app/page.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/page.tsx) | `fetch()`, `Promise.all()`, abort controllers |
| **Frontend** | Client-side routing | 0.2 | [`app/page.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/page.tsx) | Query params (`?view=inbox&issue=...`), `popstate` |
| **Frontend** | Form handling — controlled inputs | 0.2 | [`app/page.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/page.tsx) | Controlled reply box with `@` mention popup caret |
| **Frontend** | Form validation | 0.2 | [`lib/validation/form.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/validation/form.ts) | Inline form validation, error state bindings |
| **Frontend** | Frontend deployment | 0.2 | [`next.config.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/next.config.ts) | Vercel / Standalone static asset bundling |
| **Frontend** | JavaScript — async/await | 0.1 | [`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts) | `runAsyncBenchmark()` (`Promise.all` vs loop) |
| **Frontend** | JavaScript — Closures | 0.1 | [`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts) | `createMemoizer()`, private state encapsulation |
| **Frontend** | JavaScript — Event loop | 0.1 | [`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts) | `runEventLoopDemonstration()` (Microtasks/Macrotasks) |
| **Frontend** | JavaScript — Hoisting | 0.1 | [`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts) | `demonstrateHoisting()` (`var` vs TDZ vs functions) |
| **Frontend** | JavaScript — Promises vs callbacks | 0.1 | [`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts) | `promisify()`, `comparePromisesVsCallbacks()` |
| **Frontend** | Loading & error UI states | 0.2 | [`components/InterviewShowcaseModal.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/components/InterviewShowcaseModal.tsx) | Skeleton loaders, spinners, error alerts |
| **Frontend** | React component composition | 0.2 | [`components/AIInsightCard.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/components/AIInsightCard.tsx) | Slotted layouts, decoupled presentational UI |
| **Frontend** | Responsive layout & styling | 0.2 | [`app/page.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/page.tsx) | Tailwind v4 mobile-first grid, collapsible drawer |
| **Frontend** | Side effects with useEffect | 0.2 | [`app/page.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/page.tsx) | Event listeners, cleanups, polling intervals |
| **Frontend** | State management with useState | 0.2 | [`app/page.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/page.tsx) | Multi-slice state, localStorage sync |
| **NoSQL** | Aggregation pipelines | 0.2 | [`lib/db/mongo-aggregation.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/mongo-aggregation.ts) | `$match`, `$group`, `$unwind`, `$project`, `$sort` |
| **NoSQL** | CRUD operations (Mongo) | 0.2 | [`app/api/notes/route.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/notes/route.ts), [`app/api/notes/[id]/route.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/notes/[id]/route.ts) | POST (201 Created), GET, PATCH, DELETE |
| **NoSQL** | Embedding vs referencing | 0.2 | [`lib/db/mongo-aggregation.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/mongo-aggregation.ts) | 1:Few tags embedding vs 1:Many user references |
| **NoSQL** | Indexing for performance (Mongo) | 0.2 | [`lib/db/mongo-aggregation.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/mongo-aggregation.ts) | Compound `{repoFullName: 1, itemNumber: 1}`, TTL |
| **NoSQL** | Schema modeling (Mongo) | 0.2 | [`lib/db/models/AttentionNote.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/models/AttentionNote.ts) | Typed Mongoose document model & interfaces |
| **SQL** | Filtering, ordering, grouping | 0.2 | [`lib/db/sql-queries.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/sql-queries.ts) | `WHERE`, `ORDER BY`, `GROUP BY`, `HAVING` |
| **SQL** | Indexing for performance (SQL) | 0.2 | [`lib/db/postgres-transactions.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/postgres-transactions.ts) | B-Tree index, Partial index, GIN trigram |
| **SQL** | Normalization basics | 0.2 | [`lib/db/postgres-transactions.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/postgres-transactions.ts) | 1NF (Atomicity), 2NF, 3NF, BCNF |
| **SQL** | ORM usage (Prisma/Sequelize) | 0.2 | [`lib/db/postgres-transactions.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/postgres-transactions.ts) | Prisma Schema models, `@relation`, relations |
| **SQL** | Relational schema design (PK/FK) | 0.2 | [`lib/db/postgres.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/postgres.ts) | `users`, `repositories`, `pull_requests` PK/FK |
| **SQL** | SQL JOINs | 0.2 | [`lib/db/sql-queries.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/sql-queries.ts) | `INNER JOIN`, `LEFT JOIN`, `AGGREGATE JOIN` |
| **SQL** | Transactions | 0.2 | [`lib/db/postgres-transactions.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/postgres-transactions.ts) | `BEGIN`, `COMMIT`, `ROLLBACK`, row-locking |
| **System** | 3rd-party API integration | 0.3 | [`app/api/github/*`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/github/) | GitHub REST API v3, Octokit, Webhooks |
| **System** | Caching with Redis | 0.4 | [`lib/system/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/system/index.ts) | `RedisCacheManager`, Cache-Aside pattern (`getOrSet`) |
| **System** | Payment gateway integration | 0.5 | [`lib/system/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/system/index.ts) | `PaymentGatewayService`, Stripe webhook & idempotency |
| **System** | Scheduled jobs / cron | 0.3 | [`lib/system/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/system/index.ts) | `CronScheduler`, stale PR cleaner task |
| **System** | Server-side rendering (SSR) | 0.5 | [`app/layout.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/layout.tsx) | Next.js App Router hybrid SSR/CSR architecture |
| **System** | WebSocket / real-time | 0.5 | [`lib/system/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/system/index.ts) | `RealTimeBroadcastManager`, pub/sub channels |

---

# 1. AI Application Engineering

### Q1: How does Function Calling / Tool Use work with LLMs? (0.3 pts)
**1.5-Min Verbal Answer:**
"Function calling turns an LLM from a passive text generator into an action-taking agent. The model itself doesn't execute our code; instead, we provide tool declarations with strict JSON schemas—defining the function name, description, and required parameters. When user input requires external data or an action, the LLM detects that intent and pauses its text generation, emitting a structured tool call object containing the exact function name and arguments.

Our backend intercepts this tool call, validates the arguments, executes the local code—such as querying a database or an external API—and feeds the tool's execution output back to the LLM as a tool-role message. The model then synthesizes a final response using that live data.

In GitTower ([`lib/ai/agent.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/agent.ts)), we define tools like `searchGitHubIssues` and `assignReviewer`. When a developer asks to unblock a PR, the agent calls these tools dynamically. The biggest gotcha is handling hallucinations in tool arguments; we mitigate this by enforcing strict type validation before running any local execution."

---

### Q2: What is a Multi-Step Agent and how do you prevent infinite loops? (1.0 pts)
**1.5-Min Verbal Answer:**
"A multi-step agent uses an iterative reasoning loop—typically following the ReAct pattern: Thought, Action, Observation, and Reflection. Unlike a simple single-turn prompt, the agent takes a high-level goal, breaks it down into sub-tasks, selects a tool, inspects the result, and decides whether it needs more information or if it has solved the problem.

The control loop runs in our backend. In each iteration, the agent generates a thought and an action step. We execute the action, append the output to the conversation history, and recurse until the model decides to produce a final answer.

In GitTower ([`lib/ai/agent.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/agent.ts)), `runMultiStepAgent` takes a goal like 'Investigate memory leak on repository X'. Step 1 searches open issues; Step 2 computes urgency; Step 3 assigns the maintainer. To prevent runaway execution and cost spikes, we always enforce hard guardrails: a `maxSteps` limit of 5 iterations, per-step timeout timers, and a token budget. If the agent doesn't converge within 5 steps, it falls back to asking the human for clarification."

---

### Q3: How does RAG (Retrieval-Augmented Generation) work? (0.5 pts)
**1.5-Min Verbal Answer:**
"RAG solves two core problems with LLMs: knowledge cutoff dates and hallucinations on private domain data. Instead of fine-tuning the model, RAG dynamically retrieves relevant context from our own vector database at query time and injects it into the prompt.

The pipeline has two phases: Ingestion and Retrieval. During ingestion, documents are chunked into semantic segments (e.g., 500 tokens with 50-token overlap) and passed through an embedding model to generate high-dimensional vector representations. These vectors are stored in an index like Pinecone, pgvector, or Milvus. At query time, we embed the user's question, calculate cosine similarity against our stored vectors, retrieve the top-$k$ most similar chunks, and pass them inside the system prompt as grounding context.

In GitTower ([`lib/ai/agent.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/agent.ts)), we use vector cosine similarity to retrieve past triage resolutions and repository architecture docs. The trade-off is retrieval quality vs context window cost. If chunking is too small, context is lost; if too large, the prompt gets cluttered with irrelevant noise."

---

### Q4: How do you build and run LLM Eval Sets? (0.5 pts)
**1.5-Min Verbal Answer:**
"LLM evaluation sets are automated benchmark suites that treat non-deterministic language models like test-driven software. Instead of relying on manual 'vibe checks', eval sets run the model against a curated 'golden dataset' of inputs and expected outputs to measure accuracy, schema conformance, and regression across prompt changes or model upgrades.

We evaluate across three tiers: First, deterministic assertions—did the output match the strict JSON schema and return valid enum values? Second, exact-match and keyword checks on critical decision flags like urgency scores. Third, model-graded evaluations (LLM-as-a-Judge) where a stronger model grades the response on reasoning quality, relevance, and safety.

In GitTower ([`lib/ai/agent.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/agent.ts)), `runEvalSuite` runs golden triage test cases against production failure logs, measuring accuracy and output validity. Whenever we tweak system prompts or few-shot examples, running this eval suite ensures our P0 triage classification accuracy never regresses."

---

### Q5: What are Prompt Injections and how do you defend against them? (0.3 pts)
**1.5-Min Verbal Answer:**
"Prompt injection occurs when untrusted user input manipulates the LLM into ignoring its original system instructions and executing unauthorized actions—such as revealing confidential system prompts or executing destructive tools. It comes in two flavors: Direct Injections (jailbreaks) and Indirect Injections (malicious text embedded in a third-party GitHub PR or issue).

To defend against injections, we implement defense-in-depth:
1. **Input Pre-Processing & Sanitization**: Stripping system prompt delimiters (`<system>`, ````system```) and running regex guards to flag jailbreak phrases like 'ignore previous instructions'.
2. **Structural Prompt Isolation**: Wrapping user input in unambiguous, delimited XML tags (`<untrusted_input>...</untrusted_input>`) and instructing the model never to interpret text inside tags as commands.
3. **Privilege Separation & Tool Permissions**: High-risk tools (like merging a PR or deleting data) require explicit user approval rather than running autonomously.

In GitTower ([`lib/security/sanitize.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/security/sanitize.ts)), `defendAgainstPromptInjection` scans incoming PR descriptions and quarantines suspicious payloads before prompting Gemini."

---

### Q6: How do you handle Streaming Responses with LLMs? (0.3 pts)
**1.5-Min Verbal Answer:**
"LLMs generate responses token by token. If we wait for a 500-word response to finish before returning data, the user experiences 5 to 10 seconds of blank loading latency (Time to First Token / TTFT). Streaming uses Server-Sent Events (SSE) or chunked HTTP transfer encoding (`ReadableStream`) to stream tokens to the frontend in real time as they are generated.

On the server, we call the streaming API (e.g., `generateContentStream` on Gemini) which returns an asynchronous iterable stream. We pipe this stream through a `TransformStream` into Next.js App Router `Response`. On the client, React consumes the stream via the Fetch API `getReader()` loop, incrementally updating UI state.

The engineering trade-off is handling structured JSON. If you stream raw JSON, the frontend receives partial unclosed braces that break `JSON.parse`. In GitTower ([`app/api/ai/stream/route.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/ai/stream/route.ts)), for structured triage cards we use fast deterministic generation with strict schemas, and for long markdown review narratives we stream chunks with optimistic renderers."

---

### Q7: How do you monitor Token Usage and API Costs? (0.3 pts)
**1.5-Min Verbal Answer:**
"Token and cost monitoring is critical because LLM APIs charge per million input and output tokens, and runaway recursive agents can generate massive unexpected bills. Monitoring involves tracking three metrics: Prompt Token Count, Completion Token Count, and Request Latency.

In our backend API wrapper, after every Gemini or OpenAI call, we extract the `usageMetadata` object from the response. We log the exact input/output tokens to telemetry, compute the dollar cost based on model pricing (e.g., Gemini 2.0 Flash at $0.10/1M input and $0.40/1M output), and record it per user session.

In GitTower ([`lib/ai/agent.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/agent.ts)), `calculateTokenAndCost` provides real-time cost telemetry. We enforce hard caps at the middleware layer: per-user token quotas and prompt length truncation before making API calls. This prevents malicious or oversized 100,000-token payloads from draining our budget."

---

### Q8: What is Prompt Engineering & Structured Outputs? (0.4 pts)
**1.5-Min Verbal Answer:**
"Prompt engineering is the systematic design of instructions, context, and constraints passed to an LLM to maximize accuracy and consistency. In GitTower ([`lib/ai/prompts.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/prompts.ts)), we use role prompting, few-shot contextual examples, and chain-of-thought instructions guiding the model to evaluate urgency before outputting a score.

Structured outputs solve the non-deterministic formatting issue. Without strict schemas, models output markdown or conversational filler that breaks backend JSON parsers. In Gemini, we pass `responseSchema` and `responseMimeType: 'application/json'` in [`lib/ai/schemas.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/ai/schemas.ts). This enforces grammar-constrained sampling at the token-decoding layer, mathematically guaranteeing that the output strictly conforms to our TypeScript `IssueAnalysisResult` interface."

---

# 2. Authentication, Security & Middleware

### Q9: How does JWT Issuance, Verification, and Revocation work? (0.2 pts)
**1.5-Min Verbal Answer:**
"JSON Web Tokens (JWT) are stateless authentication tokens composed of three Base64URL-encoded parts: Header (algorithm & token type), Payload (claims like `userId`, `role`, `exp`), and Signature (`HMAC-SHA256(header.payload, secret)`).

When a user authenticates, the server signs the payload with a private secret and sets the JWT in an `httpOnly`, `Secure`, `SameSite=Lax` cookie. On incoming requests, our edge middleware verifies the signature using cryptographic hashing and checks the `exp` expiration timestamp. Because verification is mathematical, it requires zero database lookups, making it extremely fast.

In GitTower ([`lib/auth/jwt.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/auth/jwt.ts)), we implement `signJwt` and `verifyJwt` using Web Crypto primitives. The main trade-off is revocation: because JWTs are stateless, you cannot easily invalidate a compromised token before it expires. We solve this by keeping token lifetimes short (1 hour) and using Redis-backed blocklists or refresh token rotation for immediate revocation."

---

### Q10: How does OAuth 2.0 3rd-Party Login work under the hood? (0.2 pts)
**1.5-Min Verbal Answer:**
"OAuth 2.0 Authorization Code flow allows users to grant access to third-party resources (like their GitHub repositories) without sharing their password. The flow has four steps:

1. The client requests an authorization URL from our server (`/api/auth/url`), which generates a random CSRF `state` token and redirects the user to GitHub with our `client_id` and requested `scopes` (`repo`, `read:user`).
2. The user consents on GitHub. GitHub redirects back to our callback endpoint (`/api/auth/callback`) with a temporary one-time authorization `code` and the `state` token.
3. Our backend verifies the `state` to prevent CSRF attacks, then makes a server-to-server POST request to GitHub's token endpoint exchanging the `code` + `client_secret` for a GitHub `access_token`.
4. Our server stores the token in an encrypted, `httpOnly` cookie and sends a `postMessage('AUTH_SUCCESS')` to close the login popup.

In GitTower ([`app/api/auth/callback/route.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/auth/callback/route.ts)), this keeps secrets strictly on the backend, ensuring client-side JavaScript never has access to the client secret."

---

### Q11: How do you safely store passwords and handle Password Hashing? (0.2 pts)
**1.5-Min Verbal Answer:**
"Passwords must never be stored in plain text or using fast general-purpose hash functions like MD5 or SHA-256, because modern GPUs can compute billions of SHA-256 hashes per second using rainbow tables and brute force.

We must use slow, salted, computationally intensive key derivation functions like Argon2id, bcrypt, or PBKDF2 with SHA-256. These algorithms do two things:
1. **Cryptographic Salt**: Generates a random 16-byte salt per user to guarantee that identical passwords produce completely unique hashes, neutralizing rainbow tables.
2. **Work Factor / Iterations**: Runs 100,000+ iterations, introducing an intentional 50-100ms CPU cost per verification. This makes mass offline cracking computationally infeasible for attackers.

In GitTower ([`lib/auth/jwt.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/auth/jwt.ts)), `hashPassword` uses PBKDF2 with 100,000 iterations and random salts, storing the salt and hash formatted as `salt:hash`. On login, `verifyPassword` extracts the salt, re-computes the hash on the incoming password, and uses timing-safe comparison to prevent timing attacks."

---

### Q12: How do you implement Rate Limiting and prevent Abuse? (0.2 pts)
**1.5-Min Verbal Answer:**
"Rate limiting protects backend systems from Denial of Service (DoS) attacks, brute-force login attempts, and runaway API consumption. Common algorithms include Fixed Window, Sliding Window Log, and Token Bucket.

In GitTower ([`middleware.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/middleware.ts)), we implement an in-memory **Token Bucket algorithm** using JavaScript closures. Each client IP gets a bucket with a maximum capacity of 100 tokens. Every request consumes 1 token. Tokens refill continuously at a fixed rate (e.g., 1 token every 600ms). If a burst arrives and the bucket is empty, the middleware immediately rejects the request with `HTTP 429 Too Many Requests` and a `Retry-After` header.

In distributed production environments across multiple serverless instances, local memory isn't shared, so we back the Token Bucket with **Redis** using atomic Lua scripts (`EVAL`) or Redis Cell. This guarantees atomic increment and TTL expiration across all worker nodes without race conditions."

---

### Q13: How does Role-Based Access Control (RBAC) work in Next.js? (0.2 pts)
**1.5-Min Verbal Answer:**
"Role-Based Access Control (RBAC) restricts system actions based on assigned user roles (`Admin`, `Maintainer`, `Contributor`, `Guest`). Each role has a hierarchy or set of explicit permissions.

We enforce RBAC at two layers:
1. **Edge Middleware / Route Guard**: Intercepts requests, decodes the user's role from the verified JWT session, and immediately blocks access to administrative routes if the user doesn't meet the minimum role requirement.
2. **Route Handler Layer**: Verifies ownership before modifying records (e.g., a contributor can only edit their own attention notes, while a maintainer can edit any note in the repository).

In GitTower ([`lib/auth/jwt.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/auth/jwt.ts)), `hasPermission` checks user rank against a numeric hierarchy (`guest: 0, contributor: 1, maintainer: 2, admin: 3`). If a contributor attempts an admin endpoint, our `withErrorHandler` HOF immediately throws a typed `ForbiddenError` (HTTP 403)."

---

# 3. Backend Architecture, Testing & Databases

### Q14: How do you handle Request Body & Form Validation? (0.4 pts)
**1.5-Min Verbal Answer:**
"Incoming user input must be validated strictly before executing database queries or business logic. Validating at runtime prevents corrupted records, SQL/NoSQL injection, and unexpected runtime type errors.

In GitTower ([`lib/validation/form.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/validation/form.ts)), we implement a declarative schema engine `validateSchema`. For our attention notes creation endpoint (`POST /api/notes`), we enforce rules: `title` must be a string between 3 and 200 characters, `priority` must match an enum (`P0-P3`), and `repoFullName` must match an `owner/repo` regex pattern.

If validation fails, the handler halts execution immediately and returns `HTTP 422 Unprocessable Entity` with a structured map of field errors (`{ errors: { priority: "Priority must be P0, P1, P2, or P3" } }`). On the frontend, React forms bind directly to these field error keys to display red inline error messages next to the offending input field."

---

### Q15: How do you design RESTful Endpoints & Error Handling? (0.4 pts)
**1.5-Min Verbal Answer:**
"RESTful API design uses resource-oriented URIs and standard HTTP verbs: `GET` for retrieving, `POST` for creating (returning `201 Created`), `PATCH` for partial updates (`200 OK`), and `DELETE` for removal (`200 OK`).

In GitTower ([`app/api/notes/route.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/api/notes/route.ts) and [`lib/errors/withErrorHandler.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/errors/withErrorHandler.ts)), all route handlers are wrapped with the `withErrorHandler` Higher-Order Function. This enforces:
1. **Typed Error Hierarchy**: Custom `AppError` subclasses (`BadRequestError` [400], `UnauthorizedError` [401], `NotFoundError` [404], `ValidationError` [422], `InternalServerError` [500]).
2. **Uniform Response Envelopes**: `{ success: true, data, meta: { timestamp, path } }` on success, and `{ success: false, error: { code, message, statusCode } }` on failure.
3. **Observability**: Automatically logging 500 server errors and injecting response latency headers (`X-Response-Time`)."

---

### Q16: How do you handle File Uploads securely? (0.2 pts)
**1.5-Min Verbal Answer:**
"File uploads introduce serious security vulnerabilities: server disk exhaustion, malware execution, and MIME-type spoofing (e.g., uploading an executable disguised as a `.png`).

A secure file upload pipeline requires four steps:
1. **Size Limits & Streaming**: Reject payloads exceeding size thresholds (e.g., 10MB) before buffering into memory.
2. **Magic Byte Verification**: Never trust the user-provided `Content-Type` header or file extension. We read the first 4 to 8 bytes (the file signature) of the buffer—such as `89 50 4E 47` for PNG or `25 50 44 46` for PDF—to verify the actual file type.
3. **Filename Sanitization & Randomization**: Strip path traversal characters (`../`) and store files under UUIDs.
4. **Offloaded Storage**: Store files in object storage (AWS S3 or Cloudflare R2) using pre-signed upload URLs so raw file bytes never traverse our main application server.

In GitTower ([`lib/system/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/system/index.ts)), `validateAndProcessFileUpload` inspects magic bytes and sanitizes filenames before processing."

---

### Q17: How do MongoDB Aggregation Pipelines work? (0.2 pts)
**1.5-Min Verbal Answer:**
"MongoDB Aggregation Pipelines process multi-stage transformations on documents, similar to a Unix pipeline (`cmd1 | cmd2 | cmd3`). Each stage transforms documents as they pass through, allowing complex filtering, grouping, reshaping, and statistical calculations directly on the database engine.

Key pipeline stages include:
* `$match`: Filters documents early to reduce the working dataset (uses indexes).
* `$unwind`: Deconstructs an array field from input documents to output a document for each element.
* `$group`: Groups documents by a specified identifier (`_id`) and computes accumulator values like `$sum`, `$avg`, or `$addToSet`.
* `$project`: Reshapes output fields, computes calculated fields, and removes unnecessary data.
* `$sort` and `$limit`: Orders and paginates the aggregated result.

In GitTower ([`lib/db/mongo-aggregation.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/mongo-aggregation.ts)), `runMongoAggregationPipeline` filters unresolved triage notes, groups them by repository, and computes average resolution times in a single query."

---

### Q18: Embedding vs Referencing in NoSQL — how do you decide? (0.2 pts)
**1.5-Min Verbal Answer:**
"The choice between Embedding (Denormalization) and Referencing (Normalization) in MongoDB comes down to **Data Access Patterns** and **Relationship Cardinality**.

* **Embedding (1:1 or 1:Few bounded)**: Sub-documents are stored inside the parent document. 
  * *When to use*: Data is always read together with the parent (e.g., priority tags or reactions on an attention note) and the array has a strict upper bound. 
  * *Advantage*: High read performance via single atomic I/O operation; zero `$lookup` joins.
* **Referencing (1:Many unbounded or Many:Many)**: Storing ObjectId pointers to separate collections.
  * *When to use*: Related data grows indefinitely (e.g., an issue with 10,000 comments) or is frequently updated independently by multiple entities.
  * *Advantage*: Avoids MongoDB's 16MB document size limit and eliminates data duplication anomalies.

In GitTower ([`lib/db/models/AttentionNote.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/models/AttentionNote.ts)), we embed priority tags directly in the note, but reference the user's GitHub ID."

---

### Q19: How do ACID Transactions work in PostgreSQL? (0.2 pts)
**1.5-Min Verbal Answer:**
"ACID transactions guarantee data integrity when performing multiple related database operations:
* **Atomicity**: All operations succeed, or everything rolls back (All-or-Nothing).
* **Consistency**: The database transitions only between valid states conforming to all schema constraints and foreign keys.
* **Isolation**: Concurrent transactions execute without interfering with one another.
* **Durability**: Once committed, changes survive server crashes via write-ahead logging (WAL).

In SQL, a transaction begins with `BEGIN`, executes queries, and ends with `COMMIT`. If any query fails, `ROLLBACK` reverts every previous modification.

In GitTower ([`lib/db/postgres-transactions.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/postgres-transactions.ts)), `executeAtomicReviewTransfer` transfers a review assignment: it locks the PR row using `SELECT FOR UPDATE` to prevent race conditions, marks the old reviewer as transferred, and inserts the new reviewer. If the insert fails, it immediately rolls back, ensuring assignments are never left in an orphaned state."

---

### Q20: Database Indexing: B-Tree vs Hash vs Partial Indexes (0.2 pts)
**1.5-Min Verbal Answer:**
"Indexes are specialized data structures that allow the database engine to find rows in $O(\log N)$ or $O(1)$ time instead of performing expensive full table scans ($O(N)$).

1. **B-Tree Index (Default)**: A self-balancing tree structure. Best for equality checks (`=`), range queries (`<`, `>`), and sorting (`ORDER BY`).
2. **Partial Index**: An index with a `WHERE` filter clause. For example: `CREATE INDEX idx_unresolved ON workflow_blockers(repo_id) WHERE status = 'UNRESOLVED'`. If only 5% of blockers are unresolved, this index is 95% smaller and dramatically faster.
3. **Compound Index**: Indexes multiple columns (e.g., `(repo_id, state, created_at)`). Crucial for multi-column filters; follows the leftmost prefix rule.

In GitTower ([`lib/db/postgres-transactions.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/postgres-transactions.ts)), we use B-Tree indexes on PR states and partial indexes on active workflow blockers. The trade-off is write overhead: every `INSERT` or `UPDATE` must update the index tree."

---

### Q21: Database Normalization (1NF, 2NF, 3NF) vs Denormalization (0.2 pts)
**1.5-Min Verbal Answer:**
"Database normalization organizes relational tables to minimize data redundancy and prevent insertion, update, and deletion anomalies.

* **1NF (First Normal Form)**: Atomic values in each column, unique row identifiers (Primary Key), and no repeating groups.
* **2NF (Second Normal Form)**: Must be in 1NF + all non-key columns must depend on the *entire* Primary Key (no partial functional dependencies in composite keys).
* **3NF (Third Normal Form)**: Must be in 2NF + no transitive dependencies (non-key columns depend *only* on the Primary Key, not on other non-key columns).

In GitTower ([`lib/db/postgres.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/postgres.ts)), our schema is in 3NF: `users` stores developer metadata, `repositories` stores repo metadata, and `review_assignments` bridges them via Foreign Keys. We normalize for data consistency in transactional workflows, and selectively denormalize or use Redis caching for read-heavy dashboard summaries."

---

### Q22: How do SQL JOINs (INNER, LEFT, AGGREGATE) work? (0.2 pts)
**1.5-Min Verbal Answer:**
"SQL JOINs combine rows from two or more tables based on a related column (Foreign Key).

* **INNER JOIN**: Returns only rows where there is a match in both tables. In GitTower ([`lib/db/sql-queries.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/db/sql-queries.ts)), we join `review_assignments` with `pull_requests`, `repositories`, and `users` to fetch active assignments with reviewer avatar URLs.
* **LEFT JOIN**: Returns all rows from the left table, and matched rows from the right table. If no match exists, right table columns are `NULL`. We use this to list all repositories alongside their active workflow blockers—ensuring unblocked repositories still appear in the list with `NULL` blockers.
* **AGGREGATE JOIN**: Combines joins with `GROUP BY` and aggregate functions (`COUNT()`, `AVG()`). We use this in `/api/analytics/bottlenecks` to group by reviewer and compute average review turnaround time (TAT) across the team."

---

# 4. System Design, Caching & Integration

### Q23: How does Caching with Redis work (Cache-Aside Pattern)? (0.4 pts)
**1.5-Min Verbal Answer:**
"Redis is an in-memory key-value data store used to cache expensive database queries and third-party API responses in sub-millisecond time.

The industry-standard approach is the **Cache-Aside Pattern**:
1. When a request arrives, the application queries Redis (`GET key`).
2. If found (**Cache Hit**), the cached data is returned immediately.
3. If not found (**Cache Miss**), the application fetches data from the primary database or external API, writes it to Redis with a TTL expiration (`SETEX key 300 value`), and returns the data.
4. When data is mutated (e.g., a note is updated), the application deletes or invalidates the cached key.

In GitTower ([`lib/system/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/system/index.ts)), `redisClient.getOrSet` caches GitHub repository dashboard aggregates for 5 minutes. The gotchas to watch for are **Cache Stampede** (mitigated via mutex locking on misses) and **Stale Data** (mitigated via explicit cache invalidation on write events)."

---

### Q24: How do you integrate Payment Gateways (Stripe) and Webhooks? (0.5 pts)
**1.5-Min Verbal Answer:**
"Payment integration involves two channels: Synchronous Checkout and Asynchronous Webhooks. The browser initiates a checkout session, but the server must *never* rely on the frontend redirect to grant subscriptions because users can close the tab or tamper with client parameters.

The source of truth is **Stripe Webhooks**:
1. When a payment succeeds, Stripe sends an HTTP POST event (e.g., `checkout.session.completed`) to our `/api/webhooks/stripe` endpoint.
2. **Signature Verification**: We compute the HMAC-SHA256 signature using Stripe's raw request body and our `STRIPE_WEBHOOK_SECRET` to ensure the payload wasn't spoofed.
3. **Idempotency Guard**: Webhooks can be retried multiple times over the network. We record the unique `event.id` in our database. If already processed, we acknowledge with HTTP 200 without charging or provisioning twice.
4. **State Transition**: We update the user's subscription status (`active`, `past_due`, `canceled`).

In GitTower ([`lib/system/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/system/index.ts)), `PaymentGatewayService` implements signature verification, idempotency checks, and plan activation."

---

### Q25: How do Scheduled Jobs & Background Cron Workers work? (0.3 pts)
**1.5-Min Verbal Answer:**
"Scheduled jobs automate periodic maintenance tasks—such as archiving stale pull requests, generating daily digest emails, or syncing bottleneck metrics.

In modern web architectures, scheduled tasks follow two patterns:
1. **Serverless Cron (Vercel Cron / Cloudflare Triggers)**: An external scheduler invokes a secured API route (e.g., `/api/cron/stale-cleaner`) on a cron expression (e.g., `0 0 * * *` for midnight). The endpoint validates a `CRON_SECRET` bearer token in the headers before executing.
2. **Dedicated Background Workers (BullMQ / Redis / Celery)**: For long-running, heavy background processing, jobs are pushed onto a Redis message queue and consumed asynchronously by isolated worker threads, preventing CPU throttling on the main web server.

In GitTower ([`lib/system/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/system/index.ts)), `CronScheduler` manages tasks like `stale-pr-cleaner` and `team-bottleneck-sync`, tracking last-run timestamps and execution status."

---

### Q26: WebSockets vs Server-Sent Events (SSE) for Real-Time UI (0.5 pts)
**1.5-Min Verbal Answer:**
"Real-time communication keeps client interfaces synchronized with backend events without polling. The two primary technologies are WebSockets and Server-Sent Events (SSE):

* **WebSockets**: Full-duplex (bidirectional) TCP connection over a single socket. Ideal for collaborative real-time apps where the client is constantly sending and receiving data (e.g., live multiplayer cursor tracking, chat).
* **Server-Sent Events (SSE)**: Unidirectional (server-to-client) streaming over standard HTTP. The client opens an event stream, and the server pushes events. It has built-in auto-reconnection, works effortlessly with HTTP/2 multiplexing, and doesn't require specialized socket servers.

In GitTower ([`lib/system/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/system/index.ts)), `RealTimeBroadcastManager` coordinates real-time updates for CI build completions and incoming review requests. For our read-heavy notification model, SSE / pub-sub over HTTP is simpler, lighter on server resources, and natively supported across serverless edge infrastructure."

---

### Q27: Containerization with Docker & Multi-Stage Builds (0.5 pts)
**1.5-Min Verbal Answer:**
"Docker packages an application with its entire runtime environment—Node.js, system libraries, and configuration files—ensuring identical behavior across development, staging, and production environments.

In production Next.js deployments, we use **Multi-Stage Docker Builds** to create minimal, secure images:
* **Stage 1 (deps)**: Copies `package.json` and runs `npm ci` to install dependencies.
* **Stage 2 (builder)**: Copies source code and runs `npm run build` with `output: 'standalone'` enabled.
* **Stage 3 (runner)**: Uses a lightweight `node:alpine` base, creates a non-root `nextjs` system user, and copies *only* the standalone server and static assets.

In GitTower ([`Dockerfile`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/Dockerfile) and [`docker-compose.yml`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/docker-compose.yml)), multi-stage builds reduce our final container image size from 1.2GB down to under 120MB, eliminating build tools and reducing the security attack surface."

---

# 5. JavaScript Engine & Frontend Mastery

### Q28: How does the JavaScript Event Loop, Microtasks & Macrotasks work? (0.1 pts)
**1.5-Min Verbal Answer:**
"JavaScript is single-threaded and non-blocking, powered by the V8 event loop. The execution model consists of:
1. **Synchronous Call Stack**: Code executes top-to-bottom.
2. **Microtask Queue**: Promises (`Promise.then`, `async/await`), `queueMicrotask`, and MutationObservers.
3. **Macrotask Queue (Task Queue)**: `setTimeout`, `setInterval`, I/O, and UI rendering events.

The Event Loop rule is strict: **The engine executes all synchronous code on the call stack first. Once the stack is empty, it drains the ENTIRE Microtask queue before picking a SINGLE task from the Macrotask queue.**

If a microtask schedules another microtask, it will execute in the same tick before any `setTimeout` or UI re-render can happen. In GitTower ([`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts)), we demonstrate this exact ordering: Call Stack $\rightarrow$ Microtasks $\rightarrow$ Macrotasks."

---

### Q29: What are Closures and how are they used in Production? (0.1 pts)
**1.5-Min Verbal Answer:**
"A closure is the combination of a function bundled together with references to its lexical environment. In JavaScript, an inner function always retains access to variables declared in its outer enclosing scope, even after the outer function has finished executing.

Closures are fundamental for:
1. **Data Encapsulation & Private State**: Creating modules with private variables that cannot be modified directly from the outside.
2. **Function Factories & Memoization**: Caching expensive computation results inside a private cache map.
3. **Currying & Event Handlers**: Binding specific configuration or context to event callbacks.

In GitTower ([`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts) and [`middleware.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/middleware.ts)), `createMemoizer` encapsulates private `cache`, `hits`, and `misses` state, and our `createRateLimiter` uses a closure to maintain IP token buckets securely in memory."

---

### Q30: What is Hoisting and the Temporal Dead Zone (TDZ)? (0.1 pts)
**1.5-Min Verbal Answer:**
"Hoisting is JavaScript's default behavior of moving variable and function declarations to the top of their enclosing scope during the compilation phase, before code execution.

However, different declarations behave differently:
* **Function Declarations (`function foo() {}`)**: Fully hoisted with their implementation. You can call the function before its line of declaration.
* **`var` Declarations**: Hoisted and initialized with `undefined`. Accessing them before declaration returns `undefined` without throwing.
* **`let` and `const` Declarations**: Hoisted to the top of the block scope, but **NOT initialized**. The period between the start of the block and the declaration line is the **Temporal Dead Zone (TDZ)**. Accessing a `let` or `const` variable in the TDZ throws a `ReferenceError`.

In GitTower ([`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts)), `demonstrateHoisting` tests all three cases live."

---

### Q31: Promises vs Callbacks vs Async/Await — how do they compare? (0.1 pts)
**1.5-Min Verbal Answer:**
"JavaScript async patterns evolved across three generations:

1. **Callbacks**: The original pattern. Passing a function to be executed later. Leads to 'Callback Hell' (nested pyramid of doom), inverted control, and difficult error handling across multiple scopes.
2. **Promises**: Objects representing the eventual completion or failure of an async operation. They enable flat method chaining (`.then().catch().finally()`), composability (`Promise.all`, `Promise.race`, `Promise.allSettled`), and centralized error propagation.
3. **Async/Await**: Syntactic sugar built on top of Promises and Generators. Allows asynchronous code to read sequentially like synchronous code, using standard `try/catch` blocks.

In GitTower ([`lib/js-concepts/index.ts`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/lib/js-concepts/index.ts)), `runAsyncBenchmark` proves that executing tasks concurrently using `Promise.all` is $3\times$ faster than sequential `await` loops inside an array."

---

### Q32: React Controlled Inputs vs Uncontrolled Inputs (0.2 pts)
**1.5-Min Verbal Answer:**
"In React form handling:
* **Controlled Inputs**: The input's value is driven by React component state (`value={text}` + `onChange={(e) => setText(e.target.value)}`). React is the single source of truth.
  * *When to use*: Instant inline validation, dynamic disable states, and formatting (e.g., uppercase transforms).
* **Uncontrolled Inputs**: Form data is handled directly by the DOM itself. We access values on submission using a `useRef` hook (`inputRef.current.value`) or the native `FormData` API.
  * *When to use*: Simple forms with zero intermediate re-renders, file upload inputs, or integrating non-React UI libraries.

In GitTower ([`app/page.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/page.tsx)), the reply box is a controlled input synchronized with `@` mention autocomplete popup coordinates, while file inputs use `useRef`."

---

### Q33: How do you handle Loading & Error UI States gracefully in React? (0.2 pts)
**1.5-Min Verbal Answer:**
"Production user interfaces must handle four distinct states for every async operation: **Idle, Loading, Success, and Error**.

Best practices we implement:
1. **Skeleton Loaders over Spinners**: Skeleton placeholders maintain layout stability and prevent Cumulative Layout Shift (CLS).
2. **Optimistic UI Updates**: When a user comments or marks an item done, we immediately update local React state before the server responds. If the network request fails, we roll back state and show a toast notification.
3. **React Error Boundaries**: Wrapping UI sub-trees in `<ErrorBoundary>` to catch runtime rendering errors and render fallback recovery buttons rather than crashing the whole screen.
4. **Retry Mechanisms & Disabling Buttons**: Buttons show inline spinner icons (`<Loader2 className='animate-spin' />`) and are disabled during submission to prevent duplicate POST requests.

In GitTower ([`components/InterviewShowcaseModal.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/components/InterviewShowcaseModal.tsx)), every tab handles granular loading indicators, empty placeholders, and red error alerts."

---

### Q34: How do you achieve Responsive Layout & Styling Competence? (0.2 pts)
**1.5-Min Verbal Answer:**
"Responsive web design ensures seamless usability across mobile phones, tablets, and ultra-wide desktop monitors without layout breakage.

We achieve this via:
1. **Mobile-First Tailwind CSS Utilities**: Using breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`) where base styles target mobile and progressive enhancements activate on larger viewports (e.g., `flex-col lg:flex-row`).
2. **CSS Grid & Flexbox Composition**: Using CSS Grid (`grid-cols-1 md:grid-cols-3`) for dashboard metric cards and Flexbox for adaptive toolbars.
3. **Collapsible Navigation Drawers**: On mobile, the sidebar collapses into a slide-over drawer triggered by a hamburger menu, with click-outside event listeners and `AnimatePresence` animations.
4. **Viewport Meta & Touch Targets**: Setting `width=device-width` and ensuring all clickable interactive elements meet the minimum 44x44px touch target guidelines.

In GitTower ([`app/page.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/page.tsx)), the layout adapts smoothly from a full 3-column workstation on desktop down to a single-column prioritized feed on mobile devices."

---

### Q35: How does Server-Side Rendering (SSR) work in Next.js App Router? (0.5 pts)
**1.5-Min Verbal Answer:**
"Next.js App Router uses a hybrid architecture combining React Server Components (RSC) and Client Components (`'use client'`).

* **Server Components (Default)**: Execute only on the server at request or build time. They can directly query databases or private backend APIs without exposing secrets to the browser. They stream static HTML and a lightweight JSON payload of the virtual DOM, introducing zero client-side JavaScript bundle overhead.
* **Client Components (`'use client'`)**: Hydrated in the browser to enable interactivity, state hooks (`useState`, `useEffect`), browser APIs (`localStorage`, `window.history`), and event listeners.

In GitTower ([`app/layout.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/layout.tsx) and [`app/page.tsx`](file:///c:/Users/parveen/OneDrive/Desktop/GitTower/app/page.tsx)), root layouts and metadata are server-rendered for instant First Contentful Paint (FCP) and SEO, while the interactive triage dashboard runs as a high-performance client application."
