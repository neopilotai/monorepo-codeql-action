/**
 * Tests for babel-parser-plugins-placeholders
 */

import { transform, validateOptions } from '../src';

describe('babel-parser-plugins-placeholders', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
