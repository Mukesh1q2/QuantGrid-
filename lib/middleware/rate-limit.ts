/**
 * Rate Limiting Middleware
 * 
 * Token bucket algorithm for API rate limiting.
 * Supports per-user and per-IP limits.
 */

interface RateLimitConfig {
    maxTokens: number        // Maximum requests in window
    refillRate: number       // Tokens added per second
    windowMs: number         // Window size in milliseconds
}

interface TokenBucket {
    tokens: number
    lastRefill: number
}

// In-memory store (for production, use Redis)
const buckets = new Map<string, TokenBucket>()

// Default configurations
const RATE_LIMITS: Record<string, RateLimitConfig> = {
    default: { maxTokens: 100, refillRate: 10, windowMs: 60000 },      // 100/min
    auth: { maxTokens: 10, refillRate: 1, windowMs: 60000 },           // 10/min
    trading: { maxTokens: 50, refillRate: 5, windowMs: 60000 },        // 50/min
    upload: { maxTokens: 5, refillRate: 0.5, windowMs: 60000 },        // 5/min
    sse: { maxTokens: 5, refillRate: 1, windowMs: 60000 },             // 5 connections/min
}

/**
 * Get or create a token bucket for a key
 */
function getBucket(key: string, config: RateLimitConfig): TokenBucket {
    const existing = buckets.get(key)
    const now = Date.now()

    if (existing) {
        // Refill tokens based on time elapsed
        const elapsed = (now - existing.lastRefill) / 1000
        const tokensToAdd = elapsed * config.refillRate
        existing.tokens = Math.min(config.maxTokens, existing.tokens + tokensToAdd)
        existing.lastRefill = now
        return existing
    }

    // Create new bucket
    const bucket: TokenBucket = {
        tokens: config.maxTokens,
        lastRefill: now
    }
    buckets.set(key, bucket)
    return bucket
}

/**
 * Consume a token if available
 */
export function consumeToken(key: string, limitType: keyof typeof RATE_LIMITS = 'default'): boolean {
    const config = RATE_LIMITS[limitType]
    const bucket = getBucket(key, config)

    if (bucket.tokens >= 1) {
        bucket.tokens -= 1
        return true
    }

    return false
}

/**
 * Get remaining tokens for a key
 */
export function getRemainingTokens(key: string, limitType: keyof typeof RATE_LIMITS = 'default'): number {
    const config = RATE_LIMITS[limitType]
    const bucket = getBucket(key, config)
    return Math.floor(bucket.tokens)
}

/**
 * Get time until next token is available
 */
export function getRetryAfter(key: string, limitType: keyof typeof RATE_LIMITS = 'default'): number {
    const config = RATE_LIMITS[limitType]
    const bucket = getBucket(key, config)

    if (bucket.tokens >= 1) return 0

    const tokensNeeded = 1 - bucket.tokens
    return Math.ceil(tokensNeeded / config.refillRate)
}

/**
 * Rate limit result type
 */
export interface RateLimitResult {
    allowed: boolean
    remaining: number
    retryAfter: number
    limit: number
}

/**
 * Check rate limit and return detailed result
 */
export function checkRateLimit(
    key: string,
    limitType: keyof typeof RATE_LIMITS = 'default'
): RateLimitResult {
    const config = RATE_LIMITS[limitType]
    const allowed = consumeToken(key, limitType)

    return {
        allowed,
        remaining: getRemainingTokens(key, limitType),
        retryAfter: allowed ? 0 : getRetryAfter(key, limitType),
        limit: config.maxTokens
    }
}

/**
 * Create rate limit headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining)
    }

    if (!result.allowed) {
        headers['Retry-After'] = String(result.retryAfter)
    }

    return headers
}

/**
 * Higher-order function for rate-limited API handlers
 */
export function withRateLimit<T extends (...args: unknown[]) => Promise<Response>>(
    handler: T,
    limitType: keyof typeof RATE_LIMITS = 'default',
    getKey: (request: Request) => string = getDefaultKey
): (...args: Parameters<T>) => Promise<Response> {
    return async (...args: Parameters<T>) => {
        const request = args[0] as Request
        const key = getKey(request)
        const result = checkRateLimit(key, limitType)

        if (!result.allowed) {
            return new Response(
                JSON.stringify({
                    error: 'Too many requests',
                    retryAfter: result.retryAfter
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        ...createRateLimitHeaders(result)
                    }
                }
            )
        }

        const response = await handler(...args)

        // Add rate limit headers to successful response
        const headers = new Headers(response.headers)
        Object.entries(createRateLimitHeaders(result)).forEach(([k, v]) => {
            headers.set(k, v)
        })

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers
        })
    }
}

/**
 * Default key extractor (uses IP or authorization token)
 */
function getDefaultKey(request: Request): string {
    // Try to get user ID from auth header
    const auth = request.headers.get('authorization')
    if (auth) {
        // Hash the token or extract user ID
        return `user:${hashString(auth)}`
    }

    // Fall back to IP address
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return `ip:${forwarded.split(',')[0].trim()}`
    }

    // Default key if no IP available
    return 'anonymous'
}

/**
 * Simple string hash for key generation
 */
function hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
}

/**
 * Cleanup expired buckets (call periodically)
 */
export function cleanupExpiredBuckets(maxAgeMs: number = 3600000): number {
    const now = Date.now()
    let cleaned = 0

    for (const [key, bucket] of buckets.entries()) {
        if (now - bucket.lastRefill > maxAgeMs) {
            buckets.delete(key)
            cleaned++
        }
    }

    return cleaned
}

export default {
    checkRateLimit,
    consumeToken,
    getRemainingTokens,
    createRateLimitHeaders,
    withRateLimit,
    cleanupExpiredBuckets
}
