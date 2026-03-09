/**
 * Tests for babel-preset-preset-env
 */

import { transform, validateOptions } from '../src';

describe('babel-preset-preset-env', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
