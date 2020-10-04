export interface GridTheme {
	/**
	 * Styles the whole row where the cell is selected and also applies styling to the highligted cell
	 */
	currentRowClass?: string
	/**
	 * Styles the active highlighted column
	 */
	currentColumnClass?: string
	headerClass?: string
	cellClass?: string
}
