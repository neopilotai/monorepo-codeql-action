/**
 * Tests for babel-plugin-transform-property-semantics
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-transform-property-semantics', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
