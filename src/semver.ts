import * as semver from 'semver';

export interface ParsedVersion {
    version: string;
    major: number;
    minor: number;
    patch: number;
    prerelease: string;
    isPrerelease: boolean;
}

/**
 * Strip a prefix from a raw version string.
 * e.g. stripPrefix('v1.3.0', 'v') → '1.3.0'
 */
export function stripPrefix(raw: string, prefix: string): string {
    if (prefix && raw.startsWith(prefix)) {
        return raw.slice(prefix.length);
    }
    return raw;
}

/**
 * Extract a version string from arbitrary text using a regex pattern.
 * If pattern has a capture group, the first group is used; otherwise the full match.
 * Returns null if no match is found.
 */
export function extractVersion(raw: string, pattern: string): string | null {
    const regex = new RegExp(pattern);
    const match = regex.exec(raw);
    if (!match) return null;
    return match[1] ?? match[0];
}

/**
 * Parse a version string into semver components.
 * If strict is true, only valid semver strings are accepted.
 * If strict is false, semver.coerce is used as a fallback.
 */
export function parseVersion(raw: string, strict: boolean): ParsedVersion | null {
    // Try strict parse first
    const parsed = semver.parse(raw);
    if (parsed) {
        return {
            version: parsed.version,
            major: parsed.major,
            minor: parsed.minor,
            patch: parsed.patch,
            prerelease: parsed.prerelease.join('.'),
            isPrerelease: parsed.prerelease.length > 0
        };
    }

    // In non-strict mode, try to coerce
    if (!strict) {
        const coerced = semver.coerce(raw);
        if (coerced) {
            return {
                version: coerced.version,
                major: coerced.major,
                minor: coerced.minor,
                patch: coerced.patch,
                prerelease: '',
                isPrerelease: false
            };
        }
    }

    return null;
}
