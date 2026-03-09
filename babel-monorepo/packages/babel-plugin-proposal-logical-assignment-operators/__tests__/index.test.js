/**
 * Tests for babel-plugin-proposal-logical-assignment-operators
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-proposal-logical-assignment-operators', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
