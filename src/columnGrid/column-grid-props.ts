import { StretchMode } from '../types'
import { GridHeader, Column, NestedHeader } from './types'
import { NavigationCoords } from '../navigation/types'
import { DisableSortFilterParam } from '../gridWrapper'
import { ApiRef } from '../api/types'
import { SortState } from '../sort/useSort'

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
	coords: NavigationCoords
	defaultColumnWidth: number
	getColumnWidth: ({ index }: { index: number }) => number
	sort: SortState | null
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
