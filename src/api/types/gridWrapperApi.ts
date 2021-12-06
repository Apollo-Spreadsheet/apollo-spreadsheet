import { Grid as VirtualizedGrid } from 'react-virtualized'

export interface GridWrapperApi {
  getGridRef(): VirtualizedGrid | null
}
