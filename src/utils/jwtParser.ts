/**
 * JWT Parser Utility
 * 
 * Provides memoized JWT payload parsing with client-side validation.
 * Caches parsed payloads to improve performance.
 * 
 * NOTE: Full signature verification requires backend validation.
 * This utility provides basic client-side validation (structure, expiration, required claims)
 * to prevent malformed tokens and improve security. The backend MUST verify token signatures
 * on all authenticated requests for true security.
 */

interface JwtPayload {
    exp: number;
    userId: string | number;
    email?: string;
    role?: string;
    provider?: string;
    iat?: number;
    iss?: string;
    aud?: string;
    [key: string]: any;
}

interface ValidationResult {
    valid: boolean;
    error?: string;
}

interface ParseOptions {
    skipExpirationCheck?: boolean;
}

// JWT payload parsing cache to avoid redundant parsing
const jwtPayloadCache = new Map<string, JwtPayload>();
const MAX_CACHE_SIZE = 10; // Limit cache size to prevent memory leaks

// Required claims that must be present in JWT payload
const REQUIRED_CLAIMS = ['exp', 'userId'];
// const OPTIONAL_CLAIMS = ['email', 'role', 'provider', 'iat', 'iss', 'aud'];

/**
 * Validate JWT token structure before parsing
 * Checks basic format requirements without parsing the payload
 * 
 * @param token - JWT token
 * @returns True if token structure is valid
 */
const validateTokenStructure = (token: string): boolean => {
    if (!token || typeof token !== 'string') {
        return false;
    }

    // JWT must have exactly 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
        return false;
    }

    // Each part should be non-empty
    if (!parts[0] || !parts[1] || !parts[2]) {
        return false;
    }

    // Header and payload should be valid base64url (rough check)
    // Base64url characters: A-Z, a-z, 0-9, -, _
    const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
    if (!base64UrlRegex.test(parts[0]) || !base64UrlRegex.test(parts[1])) {
        return false;
    }

    // Signature should be valid base64url
    if (!base64UrlRegex.test(parts[2])) {
        return false;
    }

    return true;
};

/**
 * Validate JWT payload claims
 * Checks for required claims and validates expiration
 * 
 * @param payload - Parsed JWT payload
 * @returns { valid: boolean, error?: string }
 */
const validatePayloadClaims = (payload: any): ValidationResult => {
    if (!payload || typeof payload !== 'object') {
        return { valid: false, error: 'Invalid payload format' };
    }

    // Check required claims
    for (const claim of REQUIRED_CLAIMS) {
        if (!(claim in payload)) {
            return { valid: false, error: `Missing required claim: ${claim}` };
        }
    }

    // Validate expiration claim
    if (typeof payload.exp !== 'number') {
        return { valid: false, error: 'Invalid expiration claim format' };
    }

    // Check if token is expired (exp is in seconds since epoch)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
        return { valid: false, error: 'Token has expired' };
    }

    // Validate userId claim
    if (!payload.userId || (typeof payload.userId !== 'string' && typeof payload.userId !== 'number')) {
        return { valid: false, error: 'Invalid userId claim format' };
    }

    // Validate optional claims if present
    if (payload.email !== undefined && typeof payload.email !== 'string') {
        return { valid: false, error: 'Invalid email claim format' };
    }

    if (payload.role !== undefined && typeof payload.role !== 'string') {
        return { valid: false, error: 'Invalid role claim format' };
    }

    if (payload.provider !== undefined && typeof payload.provider !== 'string') {
        return { valid: false, error: 'Invalid provider claim format' };
    }

    // Validate issued at time if present (should not be in future)
    if (payload.iat !== undefined) {
        if (typeof payload.iat !== 'number') {
            return { valid: false, error: 'Invalid iat claim format' };
        }
        // iat should not be more than 1 hour in the future (clock skew tolerance)
        const maxFutureIat = now + 3600;
        if (payload.iat > maxFutureIat) {
            return { valid: false, error: 'Token issued in the future' };
        }
    }

    return { valid: true };
};

/**
 * Parse and validate JWT payload with memoization
 * 
 * Performs client-side validation:
 * - Token structure validation (before parsing)
 * - Required claims validation (exp, userId)
 * - Expiration validation
 * - Claim format validation
 * 
 * NOTE: This does NOT verify the token signature. Signature verification
 * MUST be performed by the backend on all authenticated requests.
 * The backend should use the same JWT secret/key used to sign tokens.
 * 
 * @param token - JWT token
 * @param options - Validation options
 * @param options.skipExpirationCheck - Skip expiration validation (default: false)
 * @returns Parsed and validated JWT payload or null if invalid
 */
export const parseJWTPayload = (token: string, options: ParseOptions = {}): JwtPayload | null => {
    if (!token || typeof token !== 'string') {
        return null;
    }

    // Use token as cache key (tokens are unique, so this works well)
    // For very long tokens, we could hash them, but direct comparison is faster
    if (jwtPayloadCache.has(token)) {
        const cached = jwtPayloadCache.get(token);
        // Re-validate expiration if not skipping check
        if (!options.skipExpirationCheck && cached) {
            const now = Math.floor(Date.now() / 1000);
            if (cached.exp <= now) {
                // Token expired, remove from cache
                jwtPayloadCache.delete(token);
                return null;
            }
        }
        return cached || null;
    }

    // Step 1: Validate token structure BEFORE parsing
    if (!validateTokenStructure(token)) {
        return null; // Invalid structure - don't cache
    }

    try {
        // Step 2: Parse the token
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));

        // Step 3: Validate payload claims
        const validation = validatePayloadClaims(payload);
        if (!validation.valid) {
            // Invalid payload - don't cache
            return null;
        }

        // Step 4: Cache the validated payload
        // Limit cache size to prevent memory leaks
        if (jwtPayloadCache.size >= MAX_CACHE_SIZE) {
            // Remove oldest entry (first in Map)
            const firstKey = jwtPayloadCache.keys().next().value;
            if (firstKey) jwtPayloadCache.delete(firstKey);
        }
        jwtPayloadCache.set(token, payload);

        return payload;
    } catch (e) {
        // Invalid token - don't cache errors
        return null;
    }
};

/**
 * Validate JWT token (structure and claims) without parsing
 * Useful for quick validation checks
 * 
 * @param token - JWT token
 * @returns { valid: boolean, error?: string }
 */
export const validateJWTToken = (token: string): ValidationResult => {
    if (!validateTokenStructure(token)) {
        return { valid: false, error: 'Invalid token structure' };
    }

    try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        return validatePayloadClaims(payload);
    } catch (e) {
        return { valid: false, error: 'Failed to parse token payload' };
    }
};

/**
 * Clear JWT payload cache
 * Useful when tokens are invalidated or cleared
 */
export const clearJWTPayloadCache = (): void => {
    jwtPayloadCache.clear();
};
