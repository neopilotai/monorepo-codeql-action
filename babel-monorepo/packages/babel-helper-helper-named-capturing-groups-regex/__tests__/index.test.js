/**
 * Tests for babel-helper-helper-named-capturing-groups-regex
 */

import { transform, validateOptions } from '../src';

describe('babel-helper-helper-named-capturing-groups-regex', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
