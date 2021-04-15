import { GridHeader } from './types'
import { NavigationCoords } from '../keyboard'
import { SortState } from '../sort/useSort'
import {
  ApolloColumnRowSizeProps,
  ApolloCoreProps,
  ApolloDataProps,
  ApolloLayoutProps,
  ApolloSortProps,
  ApolloVirtualizedProps,
} from '../ApolloSpreadsheetProps'

export interface ColumnGridProps
  extends ApolloVirtualizedProps,
    Pick<ApolloLayoutProps, 'stretchMode'>,
    Pick<ApolloDataProps, 'columns' | 'nestedHeaders'>,
    ApolloSortProps,
    Required<ApolloCoreProps>,
    Pick<ApolloColumnRowSizeProps, 'minRowHeight' | 'minColumnWidth'> {
  data: Array<GridHeader[]>
  coords: NavigationCoords
  getColumnWidth: ({ index }: { index: number }) => number
  sort: SortState | null
  width: number
  scrollLeft: number
  nestedRowsEnabled: boolean
}
