/**
 * Transform implementation for babel-helper-helper-get-function-arity
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
