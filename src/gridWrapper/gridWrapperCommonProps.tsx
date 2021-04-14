import { Column, NestedHeader } from '../columnGrid'
import { MergeCell, MergePosition } from '../mergeCells'
import { CellChangeParams } from '../editorManager'
import { Alignment } from 'react-virtualized'
import { OutsideClickDeselectCallback } from './gridWrapperProps'
import { NavigationCoords } from '../keyboard'

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

  /**
   * Whether CellMeasurer will set a fixed or dynamic width
   * @default true
   */
  fixedRowWidth?: boolean
  /**
   * Whether CellMeasurer will set a fixed or dynamic row height
   * @default false
   */
  fixedRowHeight?: boolean
}
