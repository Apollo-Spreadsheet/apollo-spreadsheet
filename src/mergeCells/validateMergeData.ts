import {
  containsNegativeValues,
  isOutOfBounds,
  isOverlapping,
  isSingleCell,
  isZeroSpan,
} from './validators'
import { MergeCell } from './interfaces'
import {
  MERGED_DUPLICATED,
  MERGED_NEGATIVE_VALUES,
  MERGED_OUT_OF_BONDS,
  MERGED_OVERLAP,
  MERGED_SINGLE_CELL,
  MERGED_ZERO_SPAN,
} from './validationErrorMessages'

export function validateMergeData(data: MergeCell[], rowCount: number, columnCount: number) {
  const validData: MergeCell[] = []
  data.forEach(e => {
    if (containsNegativeValues(e)) {
      console.error(MERGED_NEGATIVE_VALUES(e))
    } else if (isOutOfBounds(e, rowCount, columnCount)) {
      console.error(MERGED_OUT_OF_BONDS(e))
    } else if (isSingleCell(e)) {
      console.error(MERGED_SINGLE_CELL(e))
    } else if (isZeroSpan(e)) {
      console.error(MERGED_ZERO_SPAN(e))
    } else if (validData.some(x => x.rowIndex === e.rowIndex && x.colIndex === e.colIndex)) {
      console.error(MERGED_DUPLICATED(e))
    } else if (isOverlapping(e, validData)) {
      console.error(MERGED_OVERLAP(e))
    } else {
      validData.push(e)
    }
  })
  return validData
}
