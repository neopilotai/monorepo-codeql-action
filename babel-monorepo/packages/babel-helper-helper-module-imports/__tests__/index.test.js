/**
 * Tests for babel-helper-helper-module-imports
 */

import { transform, validateOptions } from '../src';

describe('babel-helper-helper-module-imports', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
