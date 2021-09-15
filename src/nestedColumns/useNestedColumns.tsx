import {
  COLLAPSES_COLUMNS_CHANGED,
  NestedColumnsApi,
  COLUMNS_CHANGED,
  useApiEventHandler,
  useApiExtends,
} from '../api'
import { useCallback, useEffect, useRef } from 'react'
import { useLogger } from '../logger'
import { createDepthMap } from './createDepthMap'
import { DepthMap } from './depth-map.interface'
import { ApolloCoreProps } from '../ApolloSpreadsheetProps'
import { NestedColumnsProps } from './nestedColumnsProps'
import { uniq } from 'lodash'
import { Column } from 'columnGrid'

interface Props
  extends Required<ApolloCoreProps>,
    Pick<NestedColumnsProps, 'defaultExpandedColumnsIds'> {
  enabled: boolean
  initialised: boolean
}

/**
 * This hook exposes utilities and methods to interact with Columns children
 */
export function useNestedColumns({
  apiRef,
  enabled,
  initialised,
  defaultExpandedColumnsIds,
}: Props) {
  const expandedColumnIds = useRef<string[]>([])
  const defaultIdsRef = useRef<string[]>(uniq(defaultExpandedColumnsIds) ?? [])
  const isDefaultIdsExpanded = useRef(false)
  const columnsDepthMap = useRef<DepthMap>({})
  const logger = useLogger('useNestedColumns')

  //When Columns changes we need to create the depth map
  //TODO: Might be a room for improvement just creating the depth map when the original Columns (Columns that come from props) change
  const onColumnsChanged = useCallback(
    ({ columns }: { columns: Column[] }) => {
      columnsDepthMap.current = createDepthMap(
        apiRef.current.getOriginalColumns(),
        apiRef.current.selectionKey,
      )

      //Check if expandedColumnIds are still present on the new Columns
      const removedIds: string[] = []
      expandedColumnIds.current.forEach(id => {
        const exists = columns.some(e => e[apiRef.current.selectionKey] === id)
        if (!exists) {
          logger.info(`Column id: ${id} does not exist therefore we need to remove it.`)
          removedIds.push(id)
        }
      })

      if (removedIds.length > 0) {
        logger.info(
          `Removing ${removedIds.length} ids that does not exist anymore after Columns change`,
        )
        expandedColumnIds.current = expandedColumnIds.current.filter(
          e => !removedIds.some(i => e === i),
        )
        const newColumns = columns.filter(
          e => !removedIds.some(id => id === e[apiRef.current.selectionKey]),
        )
        apiRef.current.updateColumns(newColumns)
      }
    },
    [apiRef, logger],
  )

  const toggleColumnExpand = useCallback(
    (target: string | string[]) => {
      if (!enabled) {
        return logger.warn(
          'nestedColumns are not enabled in order to perform a Column expand/collapse',
        )
      }

      const ids = Array.isArray(target) ? target : [target]
      logger.info(`Toggling ${ids.length} columns`)
      ids.forEach(id => {
        if (expandedColumnIds.current.includes(id)) {
          expandedColumnIds.current = [...expandedColumnIds.current].filter(e => e !== id)
        } else {
          expandedColumnIds.current = [...expandedColumnIds.current, id]
        }
      })
      apiRef.current.dispatchEvent(COLLAPSES_COLUMNS_CHANGED, expandedColumnIds.current)
    },
    [apiRef, enabled, logger],
  )

  const getExpandedColumns = useCallback(() => {
    return expandedColumnIds.current
  }, [])

  const isColumnExpanded = useCallback((id: string) => {
    return expandedColumnIds.current.includes(id)
  }, [])

  const getColumnDepth = useCallback((id: string) => {
    return columnsDepthMap.current[id] ?? 1
  }, [])

  const nestedColumnsApi: NestedColumnsApi = {
    toggleColumnExpand,
    isColumnExpanded,
    getExpandedColumns,
    getColumnDepth,
  }

  //Load default ids
  useEffect(() => {
    if (
      !isDefaultIdsExpanded.current &&
      defaultIdsRef.current.length > 0 &&
      initialised &&
      enabled
    ) {
      logger.info(
        `Expanded default ids: ${defaultIdsRef.current.length} on init state ${initialised}`,
      )
      isDefaultIdsExpanded.current = true
      toggleColumnExpand(defaultIdsRef.current)
    }
  }, [initialised, apiRef, toggleColumnExpand, logger, enabled])

  useApiEventHandler(apiRef, COLUMNS_CHANGED, onColumnsChanged)
  useApiExtends(apiRef, nestedColumnsApi, 'NestedColumnsApi')
  return { expandedColumnIndices: expandedColumnIds.current, isColumnExpanded }
}
