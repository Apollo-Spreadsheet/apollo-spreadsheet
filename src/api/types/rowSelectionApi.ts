import { Row } from '../../types'

export interface RowSelectionApi {
	/**
	 * Returns whether the given row id is selected or not
	 * @param id
	 */
	isRowSelected: (id: string) => boolean
	/**
	 * Selects the given id or row object (if row is passed, it will try to access the key via accessor)
	 * @param idOrRow
	 */
	selectRow: (idOrRow: string | Row) => void
	/**
	 * Returns all selected row ids
	 */
	getSelectedRowIds: () => string[]
}
