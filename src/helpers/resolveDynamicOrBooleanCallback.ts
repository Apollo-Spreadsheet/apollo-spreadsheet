import { DynamicCallback, DynamicCallbackParams, Row } from '../types'
import { isFunctionType } from './isFunctionType'

export const resolveDynamicOrBooleanCallback = (
  callbackOrValue: boolean | DynamicCallback<Row, boolean>,
  params: DynamicCallbackParams<any>,
): boolean => {
  if (isFunctionType(callbackOrValue)) {
    return callbackOrValue(params)
  }

  return callbackOrValue
}
