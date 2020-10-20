import { Header, NestedHeader } from '../columnGrid/types/header.type'
import { NavigationCoords } from '../navigation/types/navigation-coords.type'
import { GridApi } from '../types/grid-api.type'
import { GridTheme } from '../types/grid-theme'
import { RegisterChildFn } from './interfaces/registerChildFn'
import { KeyDownEventParams, SelectCellFn } from '../navigation/useNavigation'
import React from 'react'
import { MergeCell } from '../mergeCells/interfaces/merge-cell'
import { GridCell } from './interfaces/gridCell'
import {
	BeginEditingParams,
	CellChangeParams,
	IEditorState,
	StopEditingParams,
} from '../editorManager/useEditorManager'
import { Alignment } from 'react-virtualized'
import { MergePosition } from "../mergeCells/createMergedPositions";
import { StretchMode } from "../types/stretch-mode.enum";
import { ApiRef } from "../api/types/apiRef";

export interface CellEventParams<T = unknown> {
	rowIndex: number
	columnIndex: number
	cell: GridCell
	event: T
}

export interface DisableSortFilterParam {
	(column: Header): boolean
}

export interface GridWrapperCommonProps {
	headers: Header[]
	nestedHeaders?: Array<NestedHeader[]>
	// data: GridData;
	/** @default { rowIndex: 0, colIndex: 0} **/
	defaultCoords?: NavigationCoords
	/** @default false **/
	suppressNavigation?: boolean
	/** @default false **/
	outsideClickDeselects?: boolean
	onGridReady?: (gridRef: GridApi) => void
	theme?: GridTheme
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
	scrollToAlignment?: Alignment;
}

export interface GridWrapperProps<TRow = any> extends GridWrapperCommonProps {
	minRowHeight: number
	defaultColumnWidth: number
	width: number
	scrollLeft: number
	onScroll: (args: any) => any
	height: number
	registerChild?: RegisterChildFn
	rows: TRow[]
	coords: NavigationCoords
	data: GridCell[][]
	columnCount: number
	getColumnWidth: ({ index }: { index: number }) => number
	apiRef: ApiRef
	stretchMode: StretchMode
}
