import { StretchMode } from '../types/stretch-mode.enum'
import { GridHeader, Column, NestedHeader } from './types/header.type'
import { GridTheme } from '../types/grid-theme'
import { NavigationCoords } from '../navigation/types/navigation-coords.type'
import { DisableSortFilterParam } from '../gridWrapper/gridWrapperProps'
import GridWrapper from '../gridWrapper/GridWrapper'
import React from 'react'
import { ApiRef } from '../api/types'

export interface ColumnGridProps {
	/**
	 * Indicates if the sort is disabled globally or on a specific column
	 * @default true **/
	disableSort?: boolean | DisableSortFilterParam
	apiRef: ApiRef
	data: Array<GridHeader[]>
	columns: Column[]
	nestedHeaders?: Array<NestedHeader[]>
	minRowHeight: number

	defaultColumnWidth: number
	getColumnWidth: ({ index }: { index: number }) => number

	width: number
	scrollLeft: number
	/** @default StretchMode.None  */
	stretchMode?: StretchMode
	/**
	 * Overscan count buffer for react-virtualized
	 * @description Keep in mind a lower value
	 * @default 2
	 */
	overscanRowCount?: number
	/**
	 * Overscan count buffer for react-virtualized
	 * @description Keep in mind a lower value
	 * @default 2
	 */
	overscanColumnCount?: number
}
