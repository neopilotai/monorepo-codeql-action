/**
 * Tests for babel-plugin-transform-async-functions
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-transform-async-functions', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
