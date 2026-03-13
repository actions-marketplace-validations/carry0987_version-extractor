import { describe, expect, it } from 'vitest';
import { extractVersion, parseVersion, stripPrefix } from '../src/semver.js';

describe('stripPrefix', () => {
    it('strips "v" prefix', () => {
        expect(stripPrefix('v1.3.0', 'v')).toBe('1.3.0');
    });

    it('strips custom prefix', () => {
        expect(stripPrefix('release-2.0.0', 'release-')).toBe('2.0.0');
    });

    it('returns unchanged if prefix not found', () => {
        expect(stripPrefix('1.3.0', 'v')).toBe('1.3.0');
    });

    it('returns unchanged with empty prefix', () => {
        expect(stripPrefix('v1.3.0', '')).toBe('v1.3.0');
    });
});

describe('parseVersion', () => {
    describe('strict mode', () => {
        it('parses a valid semver', () => {
            const result = parseVersion('1.3.0', true);
            expect(result).toEqual({
                version: '1.3.0',
                major: 1,
                minor: 3,
                patch: 0,
                prerelease: '',
                isPrerelease: false
            });
        });

        it('parses a prerelease version', () => {
            const result = parseVersion('2.0.0-beta.1', true);
            expect(result).toEqual({
                version: '2.0.0-beta.1',
                major: 2,
                minor: 0,
                patch: 0,
                prerelease: 'beta.1',
                isPrerelease: true
            });
        });

        it('parses a prerelease with multiple identifiers', () => {
            const result = parseVersion('1.0.0-alpha.2.3', true);
            expect(result).not.toBeNull();
            expect(result?.prerelease).toBe('alpha.2.3');
            expect(result?.isPrerelease).toBe(true);
        });

        it('returns null for invalid semver in strict mode', () => {
            expect(parseVersion('not-a-version', true)).toBeNull();
        });

        it('returns null for partial version in strict mode', () => {
            expect(parseVersion('1.3', true)).toBeNull();
        });
    });

    describe('non-strict mode', () => {
        it('parses a valid semver', () => {
            const result = parseVersion('1.3.0', false);
            expect(result).not.toBeNull();
            expect(result?.version).toBe('1.3.0');
        });

        it('coerces a partial version', () => {
            const result = parseVersion('1.3', false);
            expect(result).not.toBeNull();
            expect(result?.version).toBe('1.3.0');
            expect(result?.patch).toBe(0);
        });

        it('coerces a major-only version', () => {
            const result = parseVersion('3', false);
            expect(result).not.toBeNull();
            expect(result?.version).toBe('3.0.0');
        });

        it('returns null for total garbage even in non-strict', () => {
            expect(parseVersion('hello-world', false)).toBeNull();
        });
    });
});

describe('extractVersion', () => {
    it('extracts version with capture group', () => {
        expect(extractVersion('Bump to v1.2.0', 'v(\\d+\\.\\d+\\.\\d+)')).toBe('1.2.0');
    });

    it('extracts version without capture group (full match)', () => {
        expect(extractVersion('Bump to v1.2.0', 'v\\d+\\.\\d+\\.\\d+')).toBe('v1.2.0');
    });

    it('extracts from "chore: release v1.2.0"', () => {
        expect(extractVersion('chore: release v1.2.0', 'v?(\\d+\\.\\d+\\.\\d+)')).toBe('1.2.0');
    });

    it('extracts prerelease version', () => {
        expect(extractVersion('Release v2.0.0-beta.1', 'v?(\\d+\\.\\d+\\.\\d+(?:-[\\w.]+)?)')).toBe('2.0.0-beta.1');
    });

    it('returns null when no match', () => {
        expect(extractVersion('no version here', '\\d+\\.\\d+\\.\\d+')).toBeNull();
    });

    it('extracts with strict Bump format', () => {
        expect(extractVersion('Bump to v1.2.0', '^Bump to v(\\d+\\.\\d+\\.\\d+)$')).toBe('1.2.0');
    });

    it('returns null when strict Bump format does not match', () => {
        expect(extractVersion('chore: Bump to v1.2.0', '^Bump to v(\\d+\\.\\d+\\.\\d+)$')).toBeNull();
    });
});
