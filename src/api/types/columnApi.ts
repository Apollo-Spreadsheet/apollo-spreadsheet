import { Column } from '../../columnGrid/types'

export interface ColumnApi {
  /**
   * Returns the column/header at the given index
   * Nested headers are not fetched through here
   * @param index
   */
  getColumnAt: (index: number) => Column | undefined
  getColumns: () => Column[]
  getColumnCount: () => number
  getColumnById: (id: string) => Column | undefined
  getColumnIndex: (id: string) => number
  updateColumns: (columns: Column[]) => void
  getOriginalColumns: () => Column[]
}
