import { Column } from '../columnGrid'
import { NavigationCoords } from '../keyboard'
import { GridCell } from './interfaces'
import { Index, OnScrollParams } from 'react-virtualized'
import { NestedRowsProps } from '../nestedRows'
import {
  ApolloColumnRowSizeProps,
  ApolloCoreProps,
  ApolloCrudProps,
  ApolloDataProps,
  ApolloLayoutProps,
  ApolloVirtualizedProps,
} from '../ApolloSpreadsheetProps'
import { MergePosition } from '../mergeCells'

export type DisableSortFilterCallback = (column: Column) => boolean
export type OutsideClickDeselectCallback = (target: HTMLElement) => boolean
export type DisableSortFilter = boolean | DisableSortFilterCallback
export type OutsideClickDeselect = boolean | OutsideClickDeselectCallback

export interface GridWrapperProps
  extends Pick<ApolloDataProps, 'rows' | 'columns' | 'mergeCells'>,
    Pick<
      ApolloLayoutProps,
      'stretchMode' | 'selection' | 'highlightBorderColor' | 'scrollToAlignment'
    >,
    ApolloVirtualizedProps,
    Pick<ApolloCrudProps, 'onCellChange'>,
    Required<ApolloCoreProps>,
    ApolloColumnRowSizeProps {
  mergedPositions?: MergePosition[]
  isMerged?: (coords: NavigationCoords) => boolean
  width: number
  scrollLeft: number
  onScroll?: (params: OnScrollParams) => any
  height: number
  coords: NavigationCoords
  data: GridCell[][]
  columnCount: number
  getColumnWidth: (index: Index) => number
  nestedRowsProps: NestedRowsProps
}
