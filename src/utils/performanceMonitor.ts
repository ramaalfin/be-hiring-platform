/**
 * Performance monitoring utilities for the backend.
 *
 * Provides:
 * - `withSlowQueryLog`: wraps an async DB operation and logs a warning if it
 *   exceeds the configured threshold (default 200ms).
 * - `measureAsync`: measures the execution time of any async function and
 *   returns both the result and the duration.
 */
import { logger } from "./logger";

/** Threshold in milliseconds above which a query is considered "slow". */
const SLOW_QUERY_THRESHOLD_MS = 200;

/**
 * Wraps an async database operation and logs a warning if it takes longer
 * than `thresholdMs` milliseconds.
 *
 * @param label   Human-readable label for the operation (e.g. "getApplicationsByJob")
 * @param fn      The async function to execute
 * @param thresholdMs  Threshold in ms (default: 200ms)
 * @returns The result of `fn`
 */
export async function withSlowQueryLog<T>(
    label: string,
    fn: () => Promise<T>,
    thresholdMs: number = SLOW_QUERY_THRESHOLD_MS
): Promise<T> {
    const start = Date.now();
    try {
        const result = await fn();
        const duration = Date.now() - start;

        if (duration > thresholdMs) {
            logger.warn(`Slow query detected: ${label} took ${duration}ms (threshold: ${thresholdMs}ms)`, "PERF", {
                label,
                duration,
                threshold: thresholdMs,
            });
        } else {
            logger.debug(`Query: ${label} completed in ${duration}ms`, "PERF");
        }

        return result;
    } catch (error) {
        const duration = Date.now() - start;
        logger.error(`Query failed: ${label} after ${duration}ms`, error, "PERF");
        throw error;
    }
}

/**
 * Measures the execution time of any async function.
 *
 * @param fn  The async function to measure
 * @returns   An object with `result` (the function's return value) and
 *            `durationMs` (elapsed time in milliseconds)
 */
export async function measureAsync<T>(
    fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
    const start = Date.now();
    const result = await fn();
    const durationMs = Date.now() - start;
    return { result, durationMs };
}
