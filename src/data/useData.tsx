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
} from '../api'

import { createData } from './createData'
import { Row } from '../types'

import { useLogger } from '../logger'

interface Props {
  rows: Row[]
  selection?: SelectionProps
  apiRef: ApiRef
  initialised: boolean
}

/**
 * `useData` handles all the rows and cells operations of this plugin
 */
export function useData({ rows, selection, initialised, apiRef }: Props) {
  const logger = useLogger('useData')
  const rowsRef = useRef<Row[]>(rows)
  const originalRowsRef = useRef<Row[]>(rows)
  const cells = useRef<GridCell[][]>([])
  const [, forceUpdate] = useState(false)
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

      cells.current = updatedData
      forceUpdate(p => !p)
      apiRef.current.dispatchEvent(DATA_CHANGED, { updatedData })
    },
    [apiRef, selection, logger],
  )

  const updateRows = useCallback(
    (updatedRows: Row[]) => {
      logger.debug('Updating rows.')
      //Only update the current rows
      rowsRef.current = updatedRows
      apiRef.current.dispatchEvent(ROWS_CHANGED, { rows: updatedRows })
      onRowsChangeHandle({ rows: updatedRows })
    },
    [apiRef, logger, onRowsChangeHandle],
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

  const getCells = useCallback(() => cells.current, [])

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
  return { cells: cells.current, rows: rowsRef.current }
}
