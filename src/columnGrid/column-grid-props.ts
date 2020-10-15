import { StretchMode } from '../types/stretch-mode.enum'
import { Header, NestedHeader } from './types/header.type'
import { GridTheme } from '../types/grid-theme'
import { NavigationCoords } from '../navigation/types/navigation-coords.type'

export interface ColumnGridProps {
	data: Array<Header[]>
	headers: Header[]
	nestedHeaders?: Array<NestedHeader[]>
	minRowHeight: number

	defaultColumnWidth: number
	getColumnWidth: ({ index }: { index: number }) => number

	width: number
	// scrollLeft: number
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
