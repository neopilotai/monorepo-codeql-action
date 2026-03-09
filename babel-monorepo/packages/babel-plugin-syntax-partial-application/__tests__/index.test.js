/**
 * Tests for babel-plugin-syntax-partial-application
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-syntax-partial-application', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
