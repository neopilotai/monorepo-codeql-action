/**
 * Validation for babel-plugin-proposal-logical-assignment-operators
 */

export function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  return options;
}
