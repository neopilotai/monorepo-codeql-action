/**
 * Tests for babel-plugin-transform-nullish-coalescing-operator
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-transform-nullish-coalescing-operator', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
