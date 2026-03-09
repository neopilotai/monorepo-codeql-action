/**
 * Tests for babel-plugin-transform-typeof-symbol
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-transform-typeof-symbol', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
