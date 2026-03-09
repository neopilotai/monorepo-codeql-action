/**
 * Tests for babel-module-esmodule
 */

import { transform, validateOptions } from '../src';

describe('babel-module-esmodule', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
