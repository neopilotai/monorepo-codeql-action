/**
 * Tests for babel-module-import-meta
 */

import { transform, validateOptions } from '../src';

describe('babel-module-import-meta', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
