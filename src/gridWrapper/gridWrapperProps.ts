import { Column, NestedHeader } from '../columnGrid/types'
import { NavigationCoords } from '../navigation/types'
import { MergeCell } from '../mergeCells/interfaces'
import { GridCell } from './interfaces'
import { CellChangeParams } from '../editorManager'
import { Alignment, OnScrollParams } from 'react-virtualized'
import { MergePosition } from '../mergeCells'
import { StretchMode } from '../types'
import { ApiRef } from '../api/types'
import { SelectionProps } from '../rowSelection'

export interface DisableSortFilterParam {
	(column: Column): boolean
}

export interface GridWrapperCommonProps {
	columns: Column[]
	nestedHeaders?: Array<NestedHeader[]>
	/** @default false **/
	suppressNavigation?: boolean
	/** @default false **/
	outsideClickDeselects?: boolean
	mergeCells?: MergeCell[]
	mergedPositions?: MergePosition[]
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
	onCellChange?: (params: CellChangeParams) => void
	/**
	 * Controls scroll-to-cell behavior of the Grid.
	 * The default ("auto") scrolls the least amount possible to ensure that the specified cell is fully visible.
	 * Use "start" to align cells to the top/left of the Grid and "end" to align bottom/right.
	 */
	scrollToAlignment?: Alignment

	/**
	 * Border for highlighted cell
	 */
	highlightBorderColor?: string
}

export interface GridWrapperProps<TRow = any> extends GridWrapperCommonProps {
	minRowHeight: number
	defaultColumnWidth: number
	width: number
	scrollLeft: number
	onScroll?: (params: OnScrollParams) => any
	height: number
	rows: TRow[]
	coords: NavigationCoords
	data: GridCell[][]
	columnCount: number
	getColumnWidth: ({ index }: { index: number }) => number
	apiRef: ApiRef
	stretchMode: StretchMode
	selection?: SelectionProps
}
