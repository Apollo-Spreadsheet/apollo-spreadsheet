import React from 'react'
import { RegisterChildFn } from '../core/interfaces/registerChildFn'
import { GetColumnWidthFn } from '../core/interfaces/getColumnWidthFn'
import { CellMeasurerCache } from 'react-virtualized'
import { GridCell } from '../types/row.interface'
import { MeasuredCellParent } from 'react-virtualized/dist/es/CellMeasurer'

interface CellMeasureRendererProps {
	style: React.CSSProperties
	ref?: RegisterChildFn
}

export interface MeasurerRendererProps {
	style: React.CSSProperties
	rowIndex: number
	columnIndex: number
	cell: GridCell
	getColumnWidth: GetColumnWidthFn
}

export type CellMeasureRenderer = (props: CellMeasureRendererProps) => any

export interface CellMeasureWrapperProps {
	rowSpan?: number
	colSpan?: number
	//Required for internal cell measurer
	parent: MeasuredCellParent
	rowIndex: number
	columnIndex: number
	cache: CellMeasurerCache
	cellRenderer: CellMeasureRenderer
	rendererProps: MeasurerRendererProps
	style?: React.CSSProperties
}
