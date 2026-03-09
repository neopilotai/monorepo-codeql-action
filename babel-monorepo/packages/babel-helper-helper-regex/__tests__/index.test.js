/**
 * Tests for babel-helper-helper-regex
 */

import { transform, validateOptions } from '../src';

describe('babel-helper-helper-regex', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
