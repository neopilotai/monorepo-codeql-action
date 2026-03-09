/**
 * Tests for babel-plugin-syntax-function-sent
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-syntax-function-sent', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
