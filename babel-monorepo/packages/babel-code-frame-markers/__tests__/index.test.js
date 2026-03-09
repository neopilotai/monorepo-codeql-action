/**
 * Tests for babel-code-frame-markers
 */

import { transform, validateOptions } from '../src';

describe('babel-code-frame-markers', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
