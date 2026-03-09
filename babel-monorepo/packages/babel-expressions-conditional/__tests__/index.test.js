/**
 * Tests for babel-expressions-conditional
 */

import { transform, validateOptions } from '../src';

describe('babel-expressions-conditional', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
