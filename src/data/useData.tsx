import { useCallback, useEffect, useRef, useState } from 'react'
import { SelectionProps } from '../rowSelection'
import { GridCell } from '../gridWrapper/interfaces'
import { ApiRef, RowApi } from '../api/types'
import {
  useApiExtends,
  useApiEventHandler,
  DATA_CHANGED,
  ROW_SELECTION_CHANGE,
  ROWS_CHANGED,
  COLLAPSES_CHANGED,
} from '../api'

import { createData } from './createData'
import { Row } from '../types'
import { useLogger } from '../logger'
import { flatExpandedRows } from './flatExpandedRows'

interface Props {
  rows: Row[]
  selection?: SelectionProps
  apiRef: ApiRef
  initialised: boolean
  nestedRowsEnabled: boolean
}

/**
 * `useData` handles all the rows and cells operations of this plugin
 */
export function useData({ rows, selection, initialised, apiRef, nestedRowsEnabled }: Props) {
  const logger = useLogger('useData')
  const rowsRef = useRef<Row[]>(rows)
  const originalRowsRef = useRef<Row[]>(rows)
  const cellsRef = useRef<GridCell[][]>([])
  const [cells, setCells] = useState<GridCell[][]>([])
  const selectionRef = useRef(selection)

  useEffect(() => {
    selectionRef.current = selection
  }, [selection])

  const onRowsChangeHandle = useCallback(
    (params: { rows: Row[] }) => {
      const updatedData = createData({
        ...params,
        apiRef,
        selection,
      })

      if (!updatedData) {
        return logger.error(
          'No data has been returned from createData, please review the dependencies',
        )
      }

      cellsRef.current = updatedData
      setCells(updatedData)
      apiRef.current.dispatchEvent(DATA_CHANGED, { updatedData })
    },
    [apiRef, selection, logger],
  )

  const updateRows = useCallback(
    (updatedRows: Row[]) => {
      logger.debug('Updating rows.')
      //Update current rows but if nestedRows are enabled then we need to read from the original
      rowsRef.current = nestedRowsEnabled
        ? flatExpandedRows(originalRowsRef.current, apiRef)
        : updatedRows
      apiRef.current.dispatchEvent(ROWS_CHANGED, { rows: rowsRef.current })
      onRowsChangeHandle({ rows: rowsRef.current })
    },
    [apiRef, logger, onRowsChangeHandle, nestedRowsEnabled],
  )

  //Refresh the data if any dependency change
  useEffect(() => {
    //Ensure the grid api is initialized first
    if (!initialised) {
      return
    }

    originalRowsRef.current = rows
    updateRows(rows)
  }, [rows, updateRows, initialised])

  const onRowSelectionChange = useCallback(() => {
    logger.debug('Row selection changed.')
    onRowsChangeHandle({ rows: rowsRef.current })
  }, [logger, onRowsChangeHandle])

  const onCollapsesChange = useCallback(() => {
    logger.debug('Collapses have changed')
    updateRows(rowsRef.current)
  }, [logger, updateRows])

  const getRowAt = useCallback((index: number) => rowsRef.current[index], [])

  const getRows = useCallback(() => rowsRef.current, [])

  const getRowsCount = useCallback(() => rowsRef.current.length, [])

  const getRowById = useCallback(
    (id: string) => {
      if (!selectionRef.current || !selectionRef.current?.key) {
        logger.warn('No selection key to getRowById')
        return undefined
      }
      return rowsRef.current.find(e => String(e[selectionRef.current!.key]) === id)
    },
    [logger],
  )

  const getRowsWithFilter = useCallback(
    (predicate: (value: Row, index: number, array: Row[]) => unknown, thisArg?: any) => {
      return rowsRef.current.filter(predicate, thisArg)
    },
    [],
  )

  const getRowIndex = useCallback(
    (id: string) => {
      return rowsRef.current.findIndex(e => String(e[selection?.key ?? '']) === id)
    },
    [selection?.key],
  )

  const getOriginalRows = useCallback(() => originalRowsRef.current, [])

  const getCells = useCallback(() => cellsRef.current, [])

  const rowApi: RowApi = {
    getCells,
    getRows,
    getOriginalRows,
    getRowsCount,
    getRowAt,
    getRowById,
    getRowsWithFilter,
    getRowIndex,
    updateRows,
  }

  useApiExtends(apiRef, rowApi, 'Data API')
  useApiEventHandler(apiRef, ROW_SELECTION_CHANGE, onRowSelectionChange)
  useApiEventHandler(apiRef, COLLAPSES_CHANGED, onCollapsesChange)
  return { cells, rows: rowsRef.current }
}
