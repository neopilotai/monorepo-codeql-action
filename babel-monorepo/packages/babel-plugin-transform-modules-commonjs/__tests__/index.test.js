/**
 * Tests for babel-plugin-transform-modules-commonjs
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-transform-modules-commonjs', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
