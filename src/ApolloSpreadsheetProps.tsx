import { DisableSortFilter, ICellChangeEvent, OutsideClickDeselect } from './gridWrapper'
import { GridContainerCommonProps } from './gridContainer'
import { GridTheme, Row, StretchMode } from './types'
import { KeyDownEventParams, NavigationCoords } from './keyboard'
import { SelectionProps } from './rowSelection'
import { ApiRef } from './api'
import { NestedRowsProps } from './nestedRows'
import { Column, NestedHeader } from './columnGrid'
import { MergeCell } from './mergeCells'
import { Alignment } from 'react-virtualized'
import { ReactNode } from 'react'
import { NestedColumnsProps } from './nestedColumns/nestedColumnsProps'

export interface ApolloCrudProps {
  onCreateRow?: (coords: NavigationCoords) => void
  onCellChange?: ICellChangeEvent<any>
}

export interface ApolloColumnRowSizeProps {
  /** @default 50 **/
  minRowHeight?: number
  /** @default 50 **/
  minColumnHeight?: number
  /** @default 30 **/
  minColumnWidth?: number
  /**
   * Whether CellMeasurer will set a fixed or dynamic width
   * By enabling this, CellMeasurer will be ignored therefore it results in faster performance
   * when you can predict a fixed size
   * @default true
   */
  fixedRowWidth?: boolean
  /**
   * Whether CellMeasurer will set a fixed or dynamic row height
   * By enabling this, CellMeasurer will be ignored therefore it results in faster performance
   * when you can predict a fixed size
   * @default false
   */
  fixedRowHeight?: boolean
  /**
   * Provides a constant row height or conditionally
   * @description This requires fixedRowHeight to be enabled and set to true. This is preferable when you can predict
   * the size therefore it would result in faster measurements
   * @default dynamic
   */
  rowHeight?: number
}

export interface ApolloDataProps {
  rows: Row[]
  columns: Column[]
  nestedHeaders?: Array<NestedHeader[]>
  mergeCells?: MergeCell[]
}

export interface ApolloNavigationProps {
  /** @default { rowIndex: 0, colIndex: 0} **/
  defaultCoords?: NavigationCoords
  onKeyDown?: (params: KeyDownEventParams) => void
  /** @default false **/
  suppressNavigation?: boolean
}

export interface ApolloSortProps {
  /**
   * Indicates if the sort is disabled globally or on a specific column
   * @default true **/
  disableSort?: DisableSortFilter
}

export interface ApolloLayoutProps {
  /** @default StretchMode.None  */
  stretchMode?: StretchMode
  theme?: GridTheme
  /**
   * Border for highlighted cell
   */
  highlightBorderColor?: string
  /**
   * Main grid body (rows and cells) class name
   */
  className?: string
  selection?: SelectionProps
  /** @default false **/
  outsideClickDeselects?: OutsideClickDeselect
  /**
   * Controls scroll-to-cell behavior of the Grid.
   * The default ("auto") scrolls the least amount possible to ensure that the specified cell is fully visible.
   * Use "start" to align cells to the top/left of the Grid and "end" to align bottom/right.
   */
  scrollToAlignment?: Alignment
  /**
   * Optional renderer to be used in place of rows when either :rowCount or :columnCount is 0.
   */
  noContentOverlay?: () => ReactNode
}

export interface ApolloCoreProps {
  /**
   * Providing a custom ApiRef will override internal ref by allowing the exposure of grid methods
   */
  apiRef?: ApiRef
}

export interface ApolloVirtualizedProps {
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

export interface GetScrollPosition {
  /**
   * unique id of the Table, (necessary for the scroll) **/
  id?: string
  /**
   * array of table ids that scroll when current table scrolls, (necessary for the scroll) **/
  connectToIds?: string[]
}

export type ApolloSpreadsheetProps = ApolloCoreProps &
  GridContainerCommonProps &
  NestedRowsProps &
  ApolloCrudProps &
  ApolloColumnRowSizeProps &
  ApolloSortProps &
  ApolloNavigationProps &
  ApolloLayoutProps &
  ApolloDataProps &
  ApolloVirtualizedProps &
  NestedColumnsProps &
  GetScrollPosition
