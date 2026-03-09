/**
 * Tests for babel-plugin-proposal-decorators
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-proposal-decorators', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
