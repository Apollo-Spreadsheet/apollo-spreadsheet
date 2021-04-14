import { Column, NestedHeader } from '../columnGrid'
import { MergeCell, MergePosition } from '../mergeCells'
import { Alignment } from 'react-virtualized'
import { OutsideClickDeselectCallback } from './gridWrapperProps'
import { NavigationCoords } from '../keyboard'
import { ICellChangeEvent } from './interfaces'
import { DynamicCallback } from '../types'

export interface GridWrapperCommonProps {
  columns: Column[]
  nestedHeaders?: Array<NestedHeader[]>
  /** @default false **/
  suppressNavigation?: boolean
  /** @default false **/
  outsideClickDeselects?: boolean | OutsideClickDeselectCallback
  mergeCells?: MergeCell[]
  mergedPositions?: MergePosition[]
  isMerged?: (coords: NavigationCoords) => boolean
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
  onCellChange?: ICellChangeEvent<any>
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
