/**
 * Tests for babel-messages-extract
 */

import { transform, validateOptions } from '../src';

describe('babel-messages-extract', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
