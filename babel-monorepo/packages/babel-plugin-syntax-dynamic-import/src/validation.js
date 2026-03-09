/**
 * Validation for babel-plugin-syntax-dynamic-import
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
