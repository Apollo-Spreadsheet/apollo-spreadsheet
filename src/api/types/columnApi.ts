import { Header } from "../../columnGrid/types"

export interface ColumnApi {
  /**
   * Returns the column/header at the given index
   * Nested headers are not fetched through here
   * @param index
   */
  getColumnAt: (index: number) => Header | undefined
  getColumnCount: () => number
}