import { Row } from './row.type'
import { Column } from '../columnGrid/types'

export interface DynamicCallbackParams<TRow> {
	row: TRow
	column: Column
}
export interface DynamicCallback<TRow = Row, TResult = unknown> {
	(params: DynamicCallbackParams<TRow>): TResult
}
