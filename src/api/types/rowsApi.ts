/**
 * The Row API interface that is available in the grid [[apiRef]].
 */
export interface RowApi<TRow = unknown> {
	/**
	 * Get the full set of rows as `TRow`.
	 * @returns `TRow`[]
	 */
	getRows: () => TRow[]

	/**
	 * Fetches the row at the given index
	 */
	getRowAt: (index: number) => TRow | undefined

	/**
	 * Get the total number of rows in the grid.
	 */
	getRowsCount: () => number

	getRowById: (id: string) => TRow | undefined
	getRowIndex: (id: string) => number

	getRowsWithFilter: (predicate: (value: TRow, index: number, array: TRow[]) => unknown, thisArg?: any) => TRow[]
}
