import React from 'react'
import { CellMeasurerCache } from 'react-virtualized'
import { MeasuredCellParent } from 'react-virtualized/dist/es/CellMeasurer'
import { GetColumnWidthFn } from '../gridWrapper'

export interface MeasurerRendererProps<TCell = any> {
  style: React.CSSProperties
  rowIndex: number
  columnIndex: number
  cell: TCell
  getColumnWidth: GetColumnWidthFn
}

export interface CellMeasureRendererProps<TCell = any> extends MeasurerRendererProps<TCell> {
  ref: React.LegacyRef<any>
}

export interface CellMeasureRenderer {
  (props: CellMeasureRendererProps): JSX.Element
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
