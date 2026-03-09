/**
 * Tests for babel-plugin-transform-private-methods
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-transform-private-methods', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
