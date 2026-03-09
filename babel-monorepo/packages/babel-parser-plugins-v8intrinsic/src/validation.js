/**
 * Validation for babel-parser-plugins-v8intrinsic
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
