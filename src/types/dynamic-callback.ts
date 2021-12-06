import { Column } from '../columnGrid'

export interface DynamicCallbackParams<TRow = any> {
  row: TRow
  column: Column
}
export interface DynamicCallback<TRow = any, TResult = any> {
  (params: DynamicCallbackParams<TRow>): TResult
}
