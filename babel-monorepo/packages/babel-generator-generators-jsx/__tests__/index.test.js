/**
 * Tests for babel-generator-generators-jsx
 */

import { transform, validateOptions } from '../src';

describe('babel-generator-generators-jsx', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
