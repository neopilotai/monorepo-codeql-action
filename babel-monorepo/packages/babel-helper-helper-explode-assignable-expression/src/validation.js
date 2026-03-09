/**
 * Validation for babel-helper-helper-explode-assignable-expression
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
