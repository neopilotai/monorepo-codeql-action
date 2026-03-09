/**
 * Tests for babel-plugin-syntax-optional-chaining
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-syntax-optional-chaining', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
