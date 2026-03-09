/**
 * Tests for babel-plugin-transform-new-target
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-transform-new-target', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
