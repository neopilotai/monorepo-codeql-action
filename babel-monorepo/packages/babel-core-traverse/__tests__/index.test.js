/**
 * Tests for babel-core-traverse
 */

import { transform, validateOptions } from '../src';

describe('babel-core-traverse', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
