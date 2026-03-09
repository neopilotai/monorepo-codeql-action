/**
 * Tests for babel-types-definitions
 */

import { transform, validateOptions } from '../src';

describe('babel-types-definitions', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
