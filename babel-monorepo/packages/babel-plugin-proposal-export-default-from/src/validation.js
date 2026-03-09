/**
 * Validation for babel-plugin-proposal-export-default-from
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
