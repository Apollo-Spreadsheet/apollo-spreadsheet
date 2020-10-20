import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Header } from '../columnGrid/types/header.type'
import { MergeCell } from '../mergeCells/interfaces/merge-cell'
import { Checkbox } from '@material-ui/core'
import { SelectionProps } from '../rowSelection/selectionProps'
import { GridCell } from '../gridWrapper/interfaces/gridCell'
import { insertDummyCells } from '../gridWrapper/utils/insertDummyCells'
import { formatCellValue } from './formatCellValue'
import { NavigationCoords } from '../navigation/types/navigation-coords.type'
import { ApiRef } from '../api/types/apiRef'
import { useApiExtends } from '../api/useApiExtends'
import { useApiEventHandler } from '../api/useApiEventHandler'
import { ROW_SELECTION_CHANGE } from '../api/eventConstants'
import { MergeCellsApi } from '../api/types/mergeCellsApi'
import { createData } from "./createData";

interface Props<Row> {
	rows: Row[]
	headers: Header[]
	selection?: SelectionProps<Row>
	apiRef: ApiRef
	initialised: boolean
}

/**
 * useData transforms the given data/rows into cells for internal usage and validates but also provides utilities
 */
export function useData<Row = any>({
	rows,
	headers,
	selection,
	initialised,
	apiRef,
}: Props<Row>) {
	const rowsRef = useRef<Row[]>(rows)

	const [data, setData] = useState<GridCell[][]>([])

	useEffect(() => {
		//Ensure the grid api is initialized first
		if (!initialised) {
			return
		}
		const updatedData = createData({
			headers,
			apiRef,
			selection,
		})

		if (!updatedData) {
			return
		}
		setData(updatedData)
	}, [rows, headers, apiRef, selection, initialised])

	const onRowSelectionChange = useCallback(() => {
		//Ensure the grid api is initialized first
		if (!initialised) {
			return
		}
		const updatedData = createData({
			headers,
			apiRef,
			selection,
		})
		if (!updatedData) {
			return console.log('No data returned')
		}
		setData(updatedData)
	}, [apiRef, initialised, selection])

	//Update our rows ref when changed
	useEffect(() => {
		rowsRef.current = rows
	}, [rows])

	const getRows = useCallback(() => rowsRef.current, [])
	const getRowsCount = useCallback(() => rowsRef.current.length, [rows])

	useApiExtends(
		apiRef,
		{
			getRows,
			getRowsCount,
		},
		'Rows/Data API',
	)
	useApiEventHandler(apiRef, ROW_SELECTION_CHANGE, onRowSelectionChange)
	return data
}
