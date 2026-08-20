/**
 * JavaScript Mastery Suite: Core Concepts
 * Demonstrates:
 * 1. Closures (Private State & Memoization)
 * 2. Event Loop (Microtask Queue vs Macrotask Queue vs Call Stack)
 * 3. Hoisting (var vs let/const vs Function Declarations)
 * 4. Promises vs Callbacks (Promisification & Async Flow)
 * 5. Async / Await (Parallel vs Sequential Orchestration)
 */

// ─── 1. CLOSURES ────────────────────────────────────────────────────────────

/**
 * Closure Example 1: Memoization Cache with Private State
 * The inner function retains lexical access to `cache` even after createMemoizer executes.
 */
export function createMemoizer<T extends (...args: any[]) => any>(fn: T) {
  const cache = new Map<string, ReturnType<T>>(); // Private state closed over

  return function memoized(...args: Parameters<T>): { result: ReturnType<T>; fromCache: boolean } {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return { result: cache.get(key)!, fromCache: true };
    }
    const result = fn(...args);
    cache.set(key, result);
    return { result, fromCache: false };
  };
}

/**
 * Closure Example 2: Debounce Utility
 */
export function debounce<T extends (...args: any[]) => void>(func: T, waitMs: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null; // Closed over state

  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, waitMs);
  };
}

// ─── 2. EVENT LOOP: MICROTASKS VS MACROTASKS ───────────────────────────────

export interface EventLoopLogEntry {
  step: number;
  source: 'CALL_STACK (Sync)' | 'MICROTASK_QUEUE (Promise/queueMicrotask)' | 'MACROTASK_QUEUE (setTimeout)';
  message: string;
  timestamp: number;
}

/**
 * Simulates and records the exact order of execution in the V8 Event Loop.
 * Demonstrates: Call Stack -> Microtask Queue -> Macrotask Queue
 */
export async function runEventLoopDemonstration(): Promise<EventLoopLogEntry[]> {
  const logs: EventLoopLogEntry[] = [];
  let step = 1;

  // 1. Synchronous Call Stack (Executed immediately)
  logs.push({
    step: step++,
    source: 'CALL_STACK (Sync)',
    message: '1. Synchronous script execution starts on the main thread Call Stack.',
    timestamp: performance.now(),
  });

  return new Promise((resolve) => {
    // 3. Macrotask (setTimeout - pushed to Macrotask Queue / Timer Phase)
    setTimeout(() => {
      logs.push({
        step: step++,
        source: 'MACROTASK_QUEUE (setTimeout)',
        message: '4. setTimeout callback executed after Call Stack and all Microtasks are cleared.',
        timestamp: performance.now(),
      });
      resolve(logs);
    }, 0);

    // 2. Microtask 1: Promise.then (pushed to Microtask Queue)
    Promise.resolve().then(() => {
      logs.push({
        step: step++,
        source: 'MICROTASK_QUEUE (Promise/queueMicrotask)',
        message: '3. Promise.then microtask executed immediately before any macrotasks.',
        timestamp: performance.now(),
      });
    });

    // 2. Microtask 2: queueMicrotask
    queueMicrotask(() => {
      logs.push({
        step: step++,
        source: 'MICROTASK_QUEUE (Promise/queueMicrotask)',
        message: '3b. queueMicrotask executed in the same microtask checkpoint.',
        timestamp: performance.now(),
      });
    });

    // 1b. Synchronous Call Stack continues
    logs.push({
      step: step++,
      source: 'CALL_STACK (Sync)',
      message: '2. Synchronous script block finishes. Call Stack is now empty.',
      timestamp: performance.now(),
    });
  });
}

// ─── 3. HOISTING DEMONSTRATION ──────────────────────────────────────────────

export function demonstrateHoisting() {
  const observations: string[] = [];

  // Function Declaration Hoisting: Entire function body hoisted
  const fnResult = hoistedFunction();
  observations.push(`Function Declaration: hoistedFunction() called before definition returned: "${fnResult}"`);

  function hoistedFunction() {
    return 'I am fully hoisted to the top of the scope!';
  }

  // var Hoisting: Declaration is hoisted as undefined
  var myVar = 'Assigned Value';
  observations.push(`var Variable: Declaration hoisted to top of functional/global scope initialized with undefined.`);

  // let & const Temporal Dead Zone (TDZ)
  observations.push(`let/const: Hoisted to block scope but placed in Temporal Dead Zone (TDZ) until evaluation, preventing unsafe access.`);

  return {
    concept: 'Hoisting & Scope Chain in JS Engine',
    observations,
    codeSnippet: `
// 1. Function Declaration (Fully Hoisted)
hoistedFunc(); // Works!
function hoistedFunc() { return "ok"; }

// 2. var (Hoisted with undefined)
console.log(a); // undefined
var a = 10;

// 3. let / const (Temporal Dead Zone)
console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 20;
    `.trim(),
  };
}

// ─── 4. PROMISES VS CALLBACKS ───────────────────────────────────────────────

/**
 * Promisification Utility (Node.js style callback to Promise)
 */
export function promisify<T>(
  asyncFn: (callback: (err: Error | null, result?: T) => void) => void
): () => Promise<T> {
  return () => {
    return new Promise<T>((resolve, reject) => {
      asyncFn((err, result) => {
        if (err) return reject(err);
        resolve(result as T);
      });
    });
  };
}

export function comparePromisesVsCallbacks() {
  return {
    callbackHellExample: `
// Old Callback Pattern (Inversion of Control, Pyramid of Doom)
fetchUser(userId, (err, user) => {
  if (err) return handleError(err);
  fetchRepos(user.id, (err, repos) => {
    if (err) return handleError(err);
    fetchPRs(repos[0].id, (err, prs) => {
      if (err) return handleError(err);
      console.log(prs);
    });
  });
});
    `.trim(),
    asyncAwaitExample: `
// Modern Async/Await with Promises (Synchronous-style readability, robust try/catch)
try {
  const user = await fetchUser(userId);
  const repos = await fetchRepos(user.id);
  const prs = await fetchPRs(repos[0].id);
  console.log(prs);
} catch (err) {
  handleError(err);
}
    `.trim(),
  };
}

// ─── 5. ASYNC / AWAIT (PARALLEL VS SEQUENTIAL) ─────────────────────────────

export async function runAsyncBenchmark() {
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 1. Sequential Execution (Cascading await)
  const startSeq = performance.now();
  await sleep(30);
  await sleep(30);
  const seqDuration = Math.round(performance.now() - startSeq);

  // 2. Parallel Execution (Promise.all)
  const startPar = performance.now();
  await Promise.all([sleep(30), sleep(30)]);
  const parDuration = Math.round(performance.now() - startPar);

  return {
    sequentialDurationMs: seqDuration,
    parallelDurationMs: parDuration,
    speedupFactor: `${(seqDuration / Math.max(parDuration, 1)).toFixed(1)}x faster`,
    explanation: 'Parallel execution using Promise.all / Promise.allSettled runs concurrent microtasks concurrently rather than blocking sequentially.',
  };
}
