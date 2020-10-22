import React from 'react'

export interface SelectionProps<TRow> {
	/**
	 * Unique identifier field on the row to filter and gather uniqueness for each selection
	 * **/
	key: string

	/**
	 * Middleware to enable/disable selection for specific row(s)
	 * @default true
	 * @param row
	 */
	canSelect?: (row: TRow) => boolean

	/**
	 * Classname for the row checkbox
	 */
	checkboxClass?: string

	/**
	 * @default 2%
	 */
	width?: React.ReactText
	onHeaderIconClick?: () => void
}
