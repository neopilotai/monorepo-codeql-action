/**
 * Tests for babel-plugin-syntax-dynamic-import
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-syntax-dynamic-import', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
