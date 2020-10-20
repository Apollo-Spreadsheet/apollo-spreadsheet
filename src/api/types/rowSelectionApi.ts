
export interface RowSelectionApi<TRow = unknown> {
  /**
   * Returns whether the given row id is selected or not
   * @param id
   */
  isRowSelected: (id: string) => boolean
  /**
   * Selects the given id or row object (if row is passed, it will try to access the key via accessor)
   * @param idOrRow
   */
  selectRow: (idOrRow: string | any) => void
  /**
   * Returns all selected rows
   */
  getSelectedRows: () => any[]
}