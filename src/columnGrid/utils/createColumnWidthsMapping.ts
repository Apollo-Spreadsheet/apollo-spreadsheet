import { parseColumnWidthsConfiguration } from './parseColumnWidthsConfiguration'
import { ColumnWidthDictionary, Column } from '../types'
import { StretchMode } from '../../types'
import memoizeOne from 'memoize-one'
import { dequal as isDeepEqual } from 'dequal'

/**
 * Creates an object indexing the fixed column widths by its index as key for fast lookup on dynamic widths
 * The result is also memoized and the latest is returned
 * @param columns
 * @param containerWidth
 * @param minColumnWidth
 * @param stretchMode
 */
export const createColumnWidthsMapping = memoizeOne(
  (columns: Column[], containerWidth: number, minColumnWidth: number, stretchMode: StretchMode) => {
    const mapping = columns.reduce((acc, e, i) => {
      //If there is no width or its negative, apply min column width
      if (containerWidth <= 0) {
        acc[i] = minColumnWidth
        return acc
      }

      //Just return and delay to calculate after
      if (!e.width) {
        return acc
      }

      let value = parseColumnWidthsConfiguration(e.width, containerWidth)
      //Avoid creating an entry because react-virtualized grid will use the minimum width
      if (value < minColumnWidth) {
        value = minColumnWidth
      }

      //Avoid overflow if we do have stretch mode
      if (stretchMode !== StretchMode.None && value > containerWidth) {
        value = minColumnWidth
      }

      acc[i] = value
      return acc
    }, {} as ColumnWidthDictionary)

    const isAllColWidthsFilled = columns.filter(e => e.width).length === columns.length
    let fixedTotalSize = Object.values(mapping).reduce((acc, e) => acc + e, 0)

    //Loop over the new mapping and adjust
    const remainingSize = Math.max(0, containerWidth - fixedTotalSize)

    //Check the remaining and fill
    if (!isAllColWidthsFilled) {
      const columnsNotSet = columns.filter(e => !e.width)
      //Apply the same stretch strategy of ALL
      const ratio = Math.max(minColumnWidth, remainingSize / columnsNotSet.length)
      for (const col of columnsNotSet) {
        const colIndex = columns.findIndex(e => e.id === col.id)
        mapping[colIndex] = ratio
      }
    } else if (fixedTotalSize < containerWidth) {
      //Add the remaining size into the last
      if (stretchMode === StretchMode.Last) {
        const last = Object.keys(mapping).pop()
        if (last) {
          mapping[last] += remainingSize
        }
      }

      //Add a ratio to every column with the remaining
      if (stretchMode === StretchMode.All) {
        const ratio = Math.max(minColumnWidth, remainingSize / columns.length)
        for (const key of Object.keys(mapping)) {
          mapping[key] += ratio
        }
      }
    }

    //Update the total size because the calculated values have been updated
    fixedTotalSize = Object.values(mapping).reduce((acc, e) => acc + e, 0)

    //Add a fallback to prevent overflow which might be possible using rounding numbers
    if (fixedTotalSize > containerWidth && stretchMode !== StretchMode.None) {
      //Loop over the mapping and reduce a ratio
      const overflowValue = fixedTotalSize - containerWidth
      const ratioToReduce = overflowValue / columns.length
      for (const key of Object.keys(mapping)) {
        mapping[key] -= ratioToReduce
      }
      fixedTotalSize = containerWidth
    }

    return {
      totalSize: fixedTotalSize,
      mapping,
    }
  },
  isDeepEqual,
)
