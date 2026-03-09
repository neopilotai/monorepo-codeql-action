/**
 * Validation for babel-helper-helper-member-expression-to-functions
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
