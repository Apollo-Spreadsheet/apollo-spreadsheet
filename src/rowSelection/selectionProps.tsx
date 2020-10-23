import React from 'react'
import { Row } from "../types"

export interface SelectionProps {
	/**
	 * Unique identifier field on the row to filter and gather uniqueness for each selection
	 * **/
	key: string

	/**
	 * Middleware to enable/disable selection for specific row(s)
	 * @default true
	 * @param row
	 */
	canSelect?: (row: Row) => boolean

	/**
	 * Classname for the row checkbox
	 */
	checkboxClass?: string

	/**
	 * Style for the column of selection
	 */
	className?: string
	/**
	 * Style for the cell in the selected row
	 */
	cellClassName?: string

	/**
	 * @default 2%
	 */
	width?: React.ReactText
	onHeaderIconClick?: () => void
}
