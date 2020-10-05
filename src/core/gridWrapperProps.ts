import { HeadersData } from '../columnGrid/types/header.type'
import { NavigationCoords } from '../navigation/types/navigation-coords.type'
import { GridApi } from '../types/grid-api.type'
import { GridTheme } from '../types/grid-theme'
import { RegisterChildFn } from './interfaces/registerChildFn'
import { GridRow } from '../types/row.interface'
import { SelectCellFn } from '../navigation/useNavigation'
import React from 'react'

export interface ICellMountedRegisterData {
	colIndex: number
	rowIndex: number
	elementNodeRef: Element
}

export interface ICellNodeInfo {
	rowIndex: number
	colIndex: number
	elementNodeRef: Element
}

export interface CellChangeParams<ValueType = unknown> {
	rowIndex: number
	columnIndex: number
	previousValue: ValueType
	value: ValueType
}

export interface GridWrapperCommonProps {
	headers: HeadersData
	// data: GridData;
	/** @default { rowIndex: 0, colIndex: 0} **/
	defaultCoords?: NavigationCoords
	/** @default false **/
	suppressNavigation?: boolean
	/** @default false **/
	outsideClickDeselects?: boolean
	onGridReady?: (gridRef: GridApi) => void
	theme?: GridTheme
	onCellChange: (params: CellChangeParams) => void
}

export interface GridWrapperProps extends GridWrapperCommonProps {
	className: string
	minRowHeight: number
	defaultColumnWidth: number
	width: number
	scrollLeft: number
	scrollTop: number
	isScrolling: boolean
	height: number
	registerChild: RegisterChildFn
	gridContainerRef: HTMLDivElement | null
	coords: NavigationCoords
	rows: Array<GridRow>
	columnCount: number
	selectCell: SelectCellFn
	onCellClick: (params: NavigationCoords & { event: React.MouseEvent<HTMLDivElement> }) => void
	getColumnWidth: ({ index }: { index: number }) => number
}
