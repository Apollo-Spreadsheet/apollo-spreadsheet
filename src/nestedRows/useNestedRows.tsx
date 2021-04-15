import {
  COLLAPSES_CHANGED,
  NestedRowsApi,
  ROWS_CHANGED,
  useApiEventHandler,
  useApiExtends,
} from '../api'
import { useCallback, useEffect, useRef } from 'react'
import { useLogger } from '../logger'
import { createDepthMap } from './createDepthMap'
import { Row } from '../types'
import { DepthMap } from './depth-map.interface'
import { ApolloCoreProps } from '../ApolloSpreadsheetProps'
import { NestedRowsProps } from './nestedRowsProps'

interface Props extends Required<ApolloCoreProps>, Pick<NestedRowsProps, 'defaultExpandedIds'> {
  enabled: boolean
  initialised: boolean
}

/**
 * This hook exposes utilities and methods to interact with rows children
 */
export function useNestedRows({ apiRef, enabled, initialised, defaultExpandedIds }: Props) {
  const expandedRowIds = useRef<string[]>([])
  const defaultIdsRef = useRef<string[]>(defaultExpandedIds ?? [])
  const isDefaultIdsExpanded = useRef(false)
  const rowsDepthMap = useRef<DepthMap>({})
  const logger = useLogger('useNestedRows')

  //When rows changes we need to create the depth map
  //TODO: Might be a room for improvement just creating the depth map when the original rows (rows that come from props) change
  const onRowsChanged = useCallback(
    ({ rows }: { rows: Row[] }) => {
      rowsDepthMap.current = createDepthMap(
        apiRef.current.getOriginalRows(),
        apiRef.current.selectionKey,
      )

      //Check if expandedRowIds are still present on the new rows
      const removedIds: string[] = []
      expandedRowIds.current.forEach(id => {
        const exists = rows.some(e => e[apiRef.current.selectionKey] === id)
        if (!exists) {
          logger.info(`Row id: ${id} does not exist therefore we need to remove it.`)
          removedIds.push(id)
        }
      })

      if (removedIds.length > 0) {
        logger.info(
          `Removing ${removedIds.length} ids that does not exist anymore after rows change`,
        )
        expandedRowIds.current = expandedRowIds.current.filter(e => !removedIds.some(i => e === i))
        const newRows = rows.filter(
          e => !removedIds.some(id => id === e[apiRef.current.selectionKey]),
        )
        apiRef.current.updateRows(newRows)
      }
    },
    [apiRef, logger],
  )

  const toggleRowExpand = useCallback(
    (target: string | string[]) => {
      if (!enabled) {
        return logger.warn('nestedRows are not enabled in order to perform a row expand/collapse')
      }

      const ids = Array.isArray(target) ? target : [target]
      logger.info(`Toggling ${ids.length} rows`)
      ids.forEach(id => {
        if (expandedRowIds.current.includes(id)) {
          expandedRowIds.current = [...expandedRowIds.current].filter(e => e !== id)
        } else {
          expandedRowIds.current = [...expandedRowIds.current, id]
        }
      })

      apiRef.current.dispatchEvent(COLLAPSES_CHANGED, expandedRowIds.current)
    },
    [apiRef, enabled, logger],
  )

  const getExpandedRows = useCallback(() => {
    return expandedRowIds.current
  }, [])

  const isRowExpanded = useCallback((id: string) => {
    return expandedRowIds.current.includes(id)
  }, [])

  const getRowDepth = useCallback((id: string) => {
    return rowsDepthMap.current[id] ?? 1
  }, [])

  const nestedRowsApi: NestedRowsApi = {
    toggleRowExpand,
    isRowExpanded,
    getExpandedRows,
    getRowDepth,
  }

  //Load default ids
  useEffect(() => {
    if (!isDefaultIdsExpanded.current && defaultIdsRef.current.length > 0 && initialised) {
      logger.info(
        `Expanded default ids: ${defaultIdsRef.current.length} on init state ${initialised}`,
      )
      isDefaultIdsExpanded.current = true
      toggleRowExpand(defaultIdsRef.current)
    }
  }, [initialised, apiRef, toggleRowExpand, logger])

  useApiEventHandler(apiRef, ROWS_CHANGED, onRowsChanged)
  useApiExtends(apiRef, nestedRowsApi, 'NestedRowsApi')
  return { expandedRowIndices: expandedRowIds.current, isRowExpanded }
}
