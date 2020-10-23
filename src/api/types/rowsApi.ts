import { Row } from "../../types"
import { GridCell } from "../../gridWrapper/interfaces"

/**
 * The Row API interface that is available in the grid [[apiRef]].
 */
export interface RowApi{
	/**
	 * Returns the underlying cells data
	 */
	getCells: () => GridCell[][]

	/**
	 * Get the full set of rows as `Row`.
	 * This set of rows might be sorted
	 * @returns `TRow`[]
	 */
	getRows: () => Row[]

	/**
	 * Returns the original rows passed from Apollo props without any sort applied
	 * respecting the given data order
	 */
	getOriginalRows: () => Row[]

	/**
	 * Fetches the row at the given index
	 */
	getRowAt: (index: number) => Row | undefined

	/**
	 * Get the total number of rows in the grid.
	 */
	getRowsCount: () => number

	getRowById: (id: string) => Row | undefined
	getRowIndex: (id: string) => number

	getRowsWithFilter: (predicate: (value: Row, index: number, array: Row[]) => unknown, thisArg?: any) => Row[]

	updateRows: (rows: Row[]) => void
}
