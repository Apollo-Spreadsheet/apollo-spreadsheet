/**
 * The Row API interface that is available in the grid [[apiRef]].
 */
export interface RowApi<TRow = unknown> {
	/**
	 * Get the full set of rows as [[Rows]].
	 * @returns [[Rows]]
	 */
	getRows: () => TRow[]
	/**
	 * Get the total number of rows in the grid.
	 */
	getRowsCount: () => number
}
