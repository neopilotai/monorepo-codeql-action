/**
 * Tests for babel-plugin-syntax-typescript
 */

import { transform, validateOptions } from '../src';

describe('babel-plugin-syntax-typescript', () => {
  it('should transform code', () => {
    const result = transform('const x = 1');
    expect(result.code).toBeDefined();
  });

  it('should validate options', () => {
    expect(() => validateOptions({})).not.toThrow();
  });
});
