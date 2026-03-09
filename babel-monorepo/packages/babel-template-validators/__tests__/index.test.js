/**
 * Tests for babel-template-validators
 */

import { transform, validateOptions } from '../src';

describe('babel-template-validators', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
