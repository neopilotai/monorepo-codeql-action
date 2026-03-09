/**
 * Tests for babel-runtime-helpers-objectDestructuringEmpty
 */

import { transform, validateOptions } from '../src';

describe('babel-runtime-helpers-objectDestructuringEmpty', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
