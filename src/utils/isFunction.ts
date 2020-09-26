/**
 * Returns whether a given object is a function
 * @param obj
 */
export function isFunctionType(obj: any): obj is Function {
  return typeof obj === "function";
}
