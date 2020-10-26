export interface GridTheme {
	/**
	 * Styles the whole row where the cell is selected and
	 * also applies styling to the highlighted cell
	 */
	currentRowClass?: string
	/**
	 * Styles the active highlighted column
	 */
	currentColumnClass?: string
	headerClass?: string
	nestedHeaderClass?: string
	cellClass?: string
	disabledCellClass?: string
	/**
	 * Styles to be applied in the root container of the active editor
	 * Not every editor behaves the same and this will only work for default editor, if you wish
	 * a more advanced configuration, use column/header `editorProps`
	 */
	editorClass?: string
}
