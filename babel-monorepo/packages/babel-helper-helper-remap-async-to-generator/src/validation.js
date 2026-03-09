/**
 * Validation for babel-helper-helper-remap-async-to-generator
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
