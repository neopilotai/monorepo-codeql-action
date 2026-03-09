/**
 * Tests for babel-plugin-transform-react-jsx
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-transform-react-jsx', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
