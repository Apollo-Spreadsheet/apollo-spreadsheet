import { MergeCell } from './interfaces'

export const isZeroSpan = (cell: MergeCell) => cell.rowSpan === 0 && cell.colSpan === 0

export const isSingleCell = (cell: MergeCell) => cell.rowSpan === 1 && cell.colSpan === 1

export const containsNegativeValues = (cell: MergeCell) =>
  cell.rowIndex < 0 || cell.colIndex < 0 || cell.rowSpan < 0 || cell.colSpan < 0

export const isOutOfBounds = (cell: MergeCell, rowCount: number, columnCount: number) =>
  cell.rowIndex < 0 ||
  cell.colIndex < 0 ||
  cell.rowIndex >= rowCount ||
  cell.rowIndex + cell.rowSpan - 1 >= rowCount ||
  cell.colIndex >= columnCount ||
  cell.colIndex + cell.colSpan - 1 >= columnCount

/** @todo Might need a review soon **/
export const isOverlapping = (target: MergeCell, data: MergeCell[]) => {
  //Checks if the cell is intersecting any other existing
  for (const e of data) {
    const iteratorStartIndex = { rowIndex: e.rowIndex, colIndex: e.colIndex }
    const iteratorEndIndex = {
      rowIndex: e.rowIndex + e.rowSpan - 1,
      colIndex: e.colIndex + e.colSpan - 1,
    }
    const targetStartIndex = { rowIndex: target.rowIndex, colIndex: target.colIndex }
    const targetEndIndex = {
      rowIndex: target.rowIndex + target.rowSpan - 1,
      colIndex: target.colIndex + target.colSpan - 1,
    }

    // no horizontal overlap
    if (
      iteratorStartIndex.rowIndex >= targetEndIndex.rowIndex ||
      targetStartIndex.rowIndex >= iteratorEndIndex.rowIndex
    ) {
      return false
    }

    // no vertical overlap
    if (
      iteratorStartIndex.colIndex >= targetEndIndex.colIndex ||
      targetStartIndex.colIndex >= iteratorEndIndex.colIndex
    ) {
      return false
    }

    return true
  }

  return false
}
