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
}
