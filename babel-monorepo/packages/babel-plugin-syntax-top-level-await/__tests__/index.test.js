/**
 * Tests for babel-plugin-syntax-top-level-await
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-syntax-top-level-await', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
