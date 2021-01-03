import React from 'react'
import { CellMeasurerCache } from 'react-virtualized'
import { MeasuredCellParent } from 'react-virtualized/dist/es/CellMeasurer'
import { GetColumnWidthFn, GridCell } from '../gridWrapper/interfaces'

export interface MeasurerRendererProps {
  style: React.CSSProperties
  rowIndex: number
  columnIndex: number
  cell: GridCell
  getColumnWidth: GetColumnWidthFn
}

export interface CellMeasureRenderer {
  (props: any): unknown
}

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
