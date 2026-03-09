/**
 * Tests for babel-generator-generators-flow
 */

import { transform, validateOptions } from '../src';

describe('babel-generator-generators-flow', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
