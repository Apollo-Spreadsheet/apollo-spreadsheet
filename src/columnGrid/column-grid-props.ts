import { StretchMode } from '../types/stretch-mode.enum'
import { GridHeader, Header, NestedHeader } from "./types/header.type"
import { GridTheme } from '../types/grid-theme'
import { NavigationCoords } from '../navigation/types/navigation-coords.type'
import { DisableSortFilterParam } from "../gridWrapper/gridWrapperProps"

export interface ColumnGridProps {
	/**
	 * Indicates if the sort is disabled globally or on a specific column
	 * @default true **/
	disableSort?: boolean | DisableSortFilterParam

	data: Array<GridHeader[]>
	headers: Header[]
	nestedHeaders?: Array<NestedHeader[]>
	minRowHeight: number

	defaultColumnWidth: number
	getColumnWidth: ({ index }: { index: number }) => number

	width: number
	scrollLeft: number
	// isScrolling: boolean
	theme?: GridTheme
	coords: NavigationCoords
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
	onSortClick: (field: string) => void
	sort: { field: string; order: 'asc' | 'desc' } | null
}
