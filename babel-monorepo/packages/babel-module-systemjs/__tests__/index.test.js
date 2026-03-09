/**
 * Tests for babel-module-systemjs
 */

import { transform, validateOptions } from '../src';

describe('babel-module-systemjs', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
