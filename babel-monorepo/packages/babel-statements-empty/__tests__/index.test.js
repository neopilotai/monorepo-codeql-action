/**
 * Tests for babel-statements-empty
 */

import { transform, validateOptions } from '../src';

describe('babel-statements-empty', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
