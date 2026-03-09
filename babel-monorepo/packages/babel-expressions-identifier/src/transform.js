/**
 * Transform implementation for babel-expressions-identifier
 */

export function transform(code, options = {}) {
  return {
    code,
    map: null,
    ast: null
  };
}

export function transformFromAst(ast, code, options = {}) {
  return transform(code, options);
}
