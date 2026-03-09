/**
 * Tests for babel-statements-throw
 */

import { transform, validateOptions } from '../src';

describe('babel-statements-throw', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
