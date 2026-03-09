/**
 * Tests for babel-preset-env-preset-data
 */

import { transform, validateOptions } from '../src';

describe('babel-preset-env-preset-data', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
