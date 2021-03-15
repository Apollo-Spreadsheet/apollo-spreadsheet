import { useCallback, useEffect, useRef } from 'react'
import { NavigationCoords } from '../navigation/types'
import { validateMergeData } from './validateMergeData'
import { MergeCell } from './interfaces'
import { createMergedPositions, MergePosition } from './createMergedPositions'
import { createMergedGroups, MergeGroup } from './createMergedGroups'
import { useApiExtends, ApiRef, MergeCellsApi } from '../api'
import { useLogger } from '../logger'

export interface MergedCellsHookProps {
  mergeCells?: MergeCell[]
  rowCount: number
  columnCount: number
  apiRef: ApiRef
  initialised: boolean
}

/**
 * Provides validation for merged data, handles the lookup with navigation coordinates and
 * return util functions
 * @param data
 */
export function useMergeCells({ mergeCells, rowCount, columnCount, apiRef }: MergedCellsHookProps) {
  const logger = useLogger('useMergeCells')
  const mergedPositions = useRef<MergePosition[]>([])
  const mergeGroups = useRef<MergeGroup>({})
  const mergeData = useRef<MergeCell[]>([])
  useEffect(() => {
    if (!mergeCells) {
      return
    }
    logger.debug('Creating and validating merged cells')
    mergeData.current = validateMergeData(mergeCells, rowCount, columnCount)
    mergeGroups.current = createMergedGroups(mergeCells)
    mergedPositions.current = createMergedPositions(mergeCells)
  }, [mergeCells, rowCount, columnCount, logger])

  const isMerged = useCallback(({ rowIndex, colIndex }: NavigationCoords) => {
    return mergedPositions.current.some(e => e.row === rowIndex && e.col === colIndex)
  }, [])

  /**
   * Returns the parent of the merged position given
   * @param coords
   * @returns The parent coordinates or nothing
   */
  const getMergeParentCoords = useCallback(({ rowIndex, colIndex }: NavigationCoords) => {
    const targets = mergeData.current.filter(e => e.colIndex === colIndex)
    if (targets.length === 0) {
      console.error(
        `Please review your setup, target merge column not found at getMergedPath from navigation. Given input [${rowIndex}, ${colIndex}]`,
      )
      return undefined
    }

    //Search for the target that is between an interval of indices
    const target = targets.find(target => {
      const rowStart = target.rowIndex
      const rowEnd = target.rowIndex + target.rowSpan - 1
      return rowIndex >= rowStart && rowIndex <= rowEnd
    })

    if (target) {
      return { rowIndex: target.rowIndex, colIndex: target.colIndex }
    }

    return undefined
  }, [])

  /**
   * Returns the col/row span of the given colIndex/rowIndex
   * @param coords
   */
  const getSpanProperties = useCallback(
    (coords: NavigationCoords) =>
      mergeData.current.find(e => e.rowIndex === coords.rowIndex && e.colIndex === coords.colIndex),
    [],
  )

  const getMergedData = useCallback(() => mergeData.current, [])
  const getMergedGroups = useCallback(() => mergeGroups.current, [])

  const mergedCellsApi: MergeCellsApi = {
    getSpanProperties,
    isMerged,
    getMergeParentCoords,
    getMergedData,
    getMergedGroups,
  }

  useApiExtends(apiRef, mergedCellsApi, 'MergeCellsAPI')
  return { mergedPositions: mergedPositions.current, mergedCells: mergeData.current, isMerged }
}
