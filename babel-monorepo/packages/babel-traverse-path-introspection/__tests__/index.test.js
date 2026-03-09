/**
 * Tests for babel-traverse-path-introspection
 */

import { transform, validateOptions } from '../src';

describe('babel-traverse-path-introspection', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
