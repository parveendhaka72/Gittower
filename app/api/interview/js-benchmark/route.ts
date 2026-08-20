import { withErrorHandler, jsonResponse } from '@/lib/errors/withErrorHandler';
import { 
  runEventLoopDemonstration, 
  demonstrateHoisting, 
  comparePromisesVsCallbacks, 
  runAsyncBenchmark,
  createMemoizer
} from '@/lib/js-concepts';

/**
 * GET /api/interview/js-benchmark
 * Demonstrates:
 * 1. Event Loop trace (Microtask vs Macrotask)
 * 2. Closures & Memoization
 * 3. Hoisting & TDZ
 * 4. Promises vs Callbacks
 * 5. Async/Await Performance Benchmark
 */
export const GET = withErrorHandler(async () => {
  // 1. Run Event Loop Simulation
  const eventLoopLogs = await runEventLoopDemonstration();

  // 2. Run Hoisting Evaluation
  const hoistingData = demonstrateHoisting();

  // 3. Compare Promises vs Callbacks
  const promiseComparison = comparePromisesVsCallbacks();

  // 4. Run Async/Await Benchmark
  const asyncBenchmark = await runAsyncBenchmark();

  // 5. Test Closure Memoizer
  let computeCount = 0;
  const expensiveCalculation = (x: number) => {
    computeCount++;
    return x * x * 100;
  };
  const memoizedCalc = createMemoizer(expensiveCalculation);
  const firstCall = memoizedCalc(42);
  const secondCall = memoizedCalc(42);

  return jsonResponse({
    eventLoop: {
      title: 'V8 Event Loop Microtask vs Macrotask Execution Order',
      timeline: eventLoopLogs,
    },
    closures: {
      title: 'Closure-based Memoization & Private State',
      firstCall,
      secondCall,
      totalExecutions: computeCount,
      isCacheWorking: secondCall.fromCache && computeCount === 1,
    },
    hoisting: hoistingData,
    promisesVsCallbacks: promiseComparison,
    asyncAwaitBenchmark: asyncBenchmark,
  }, 200);
});
