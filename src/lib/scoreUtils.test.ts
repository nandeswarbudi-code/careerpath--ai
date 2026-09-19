import { describe, expect, it } from 'vitest';
import { boundedScore } from './scoreUtils';

describe('boundedScore', () => {
  it('clamps numeric model output to the supported range', () => {
    expect(boundedScore(-10)).toBe(0);
    expect(boundedScore(42.6)).toBe(43);
    expect(boundedScore(150)).toBe(100);
  });

  it('rejects non-finite and non-numeric values', () => {
    expect(boundedScore(Number.NaN)).toBeNull();
    expect(boundedScore(Number.POSITIVE_INFINITY)).toBeNull();
    expect(boundedScore('90')).toBeNull();
  });
});
