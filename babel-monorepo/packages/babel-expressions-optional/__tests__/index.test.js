/**
 * Tests for babel-expressions-optional
 */

import { transform, validateOptions } from '../src';

describe('babel-expressions-optional', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
