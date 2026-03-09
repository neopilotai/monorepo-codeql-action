/**
 * Validation for babel-plugin-syntax-logical-assignment-operators
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
