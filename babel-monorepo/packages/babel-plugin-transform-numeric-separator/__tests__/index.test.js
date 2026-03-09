/**
 * Tests for babel-plugin-transform-numeric-separator
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-transform-numeric-separator', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
