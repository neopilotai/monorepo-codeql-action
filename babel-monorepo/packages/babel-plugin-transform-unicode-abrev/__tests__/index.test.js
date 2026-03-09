/**
 * Tests for babel-plugin-transform-unicode-abrev
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-transform-unicode-abrev', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
