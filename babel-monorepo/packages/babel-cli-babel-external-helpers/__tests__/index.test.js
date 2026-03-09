/**
 * Tests for babel-cli-babel-external-helpers
 */

import { transform, validateOptions } from '../src';

describe('babel-cli-babel-external-helpers', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
