/**
 * Tests for babel-parser-plugins-jsx
 */

import { transform, validateOptions } from '../src';

describe('babel-parser-plugins-jsx', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
