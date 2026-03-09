/**
 * Tests for babel-plugin-transform-modules
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-transform-modules', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
