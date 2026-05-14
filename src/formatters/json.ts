import type { BenchmarkResult } from '../benchmark.js';

export function toJson(result: BenchmarkResult, opts?: { pretty?: boolean }): string {
  return opts?.pretty === true ? JSON.stringify(result, null, 2) : JSON.stringify(result);
}
