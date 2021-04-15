import { DynamicCallback, DynamicCallbackParams, Row } from '../types'
import { isFunctionType } from './isFunctionType'

/**
 * Returns the value against the provided generic but in case a function is provided
 * it will be resolved accordingly and must return the same generic value
 * @param callbackOrValue
 * @param params
 */
export const resolveDynamicCallback = <Value = any | Function, TRow = Row>(
  callbackOrValue: Value | DynamicCallback<TRow, Value>,
  params: DynamicCallbackParams<TRow>,
): Value => {
  if (isFunctionType(callbackOrValue)) {
    return callbackOrValue(params)
  }

  return callbackOrValue
}
