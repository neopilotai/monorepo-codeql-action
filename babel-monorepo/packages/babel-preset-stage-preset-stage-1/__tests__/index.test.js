/**
 * Tests for babel-preset-stage-preset-stage-1
 */

import { transform, validateOptions } from '../src';

describe('babel-preset-stage-preset-stage-1', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
