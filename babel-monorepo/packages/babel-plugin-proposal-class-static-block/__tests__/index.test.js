/**
 * Tests for babel-plugin-proposal-class-static-block
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-proposal-class-static-block', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
