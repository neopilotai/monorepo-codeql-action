/**
 * Tests for babel-plugin-syntax-export-namespace-from
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-syntax-export-namespace-from', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
