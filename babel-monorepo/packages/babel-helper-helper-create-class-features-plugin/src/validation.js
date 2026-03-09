/**
 * Validation for babel-helper-helper-create-class-features-plugin
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
