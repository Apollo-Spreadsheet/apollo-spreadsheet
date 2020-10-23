import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Column } from '../columnGrid/types/header.type'
import { SelectionProps } from '../rowSelection/selectionProps'
import { GridCell } from '../gridWrapper/interfaces/gridCell'
import { ApiRef } from '../api/types/apiRef'
import { useApiExtends } from '../api/useApiExtends'
import { useApiEventHandler } from '../api/useApiEventHandler'
import { DATA_CHANGED, ROW_SELECTION_CHANGE, ROWS_CHANGED } from '../api/eventConstants'
import { createData } from './createData'
import { Row } from '../types'
import { RowApi } from '../api/types'

interface Props {
	rows: Row[]
	columns: Column[]
	selection?: SelectionProps
	apiRef: ApiRef
	initialised: boolean
}

/**
 * `useData` handles all the rows and cells operations of this plugin
 */
export function useData({ rows, columns, selection, initialised, apiRef }: Props) {
	const rowsRef = useRef<Row[]>(rows)
	const originalRowsRef = useRef<Row[]>(rows)
	const cells = useRef<GridCell[][]>([])
	const [_, forceUpdate] = useState(false)

	const onRowsChangeHandle = useCallback(
		(params: { rows: Row[]; columns: Column[] }) => {
			const updatedData = createData({
				...params,
				apiRef,
				selection,
			})

			if (!updatedData) {
				return console.error('No data has been returned from createData')
			}

			cells.current = updatedData
			forceUpdate(p => !p)
			apiRef.current.dispatchEvent(DATA_CHANGED, { updatedData })
		},
		[initialised, selection, apiRef],
	)

	const updateRows = useCallback(
		(updatedRows: Row[]) => {
			//Only update the current rows
			rowsRef.current = updatedRows
			apiRef.current.dispatchEvent(ROWS_CHANGED, { rows: updatedRows })
			onRowsChangeHandle({ rows: updatedRows, columns: apiRef.current.getColumns() })
		},
		[apiRef, selection],
	)

	//Refresh the data if any dependency change
	useEffect(() => {
		//Ensure the grid api is initialized first
		if (!initialised) {
			return
		}
		originalRowsRef.current = rows
		updateRows(rows)
	}, [rows, columns, updateRows, initialised, onRowsChangeHandle])

	const onRowSelectionChange = useCallback(() => {
		onRowsChangeHandle({ rows: rowsRef.current, columns: columns })
	}, [onRowsChangeHandle])

	const getRowAt = useCallback((index: number) => rowsRef.current[index], [])
	const getRows = useCallback(() => rowsRef.current, [])
	const getRowsCount = useCallback(() => rowsRef.current.length, [rows])
	const getRowById = useCallback(
		(id: string) => rowsRef.current.find(e => String(e[selection?.key ?? '']) === id),
		[],
	)
	const getRowsWithFilter = useCallback(
		(predicate: (value: Row, index: number, array: Row[]) => unknown, thisArg?: any) =>
			rowsRef.current.filter(predicate, thisArg),
		[],
	)
	const getRowIndex = useCallback(
		(id: string) => rowsRef.current.findIndex(e => String(e[selection?.key ?? '']) === id),
		[],
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
