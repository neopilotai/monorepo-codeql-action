/**
 * Tests for babel-plugin-syntax-pipeline-operator
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-syntax-pipeline-operator', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
