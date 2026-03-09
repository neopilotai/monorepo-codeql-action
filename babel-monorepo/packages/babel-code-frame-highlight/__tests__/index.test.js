/**
 * Tests for babel-code-frame-highlight
 */

import { transform, validateOptions } from '../src';

describe('babel-code-frame-highlight', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
