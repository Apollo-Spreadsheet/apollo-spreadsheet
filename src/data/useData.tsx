import React, { useCallback, useEffect, useMemo, useState } from 'react'
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

interface Props<Row> {
	rows: Row[]
	headers: Header[]
	selection?: SelectionProps<Row>
	isMerged: MergeCellsApi['isMerged']
	getSpanProperties: MergeCellsApi['getSpanProperties']
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
	isMerged,
	getSpanProperties,
}: Props<Row>) {
	function buildData() {
		//Ensure the grid api is initialized first
		if (!initialised) {
			return
		}

		const cellsList = rows.reduce((list, row, rowIndex) => {
			const cells = headers.reduce((_cells, header, colIndex) => {
				const isDummy = isMerged({ rowIndex, colIndex })
				if (isDummy) {
					return _cells
				}

				const spanInfo = getSpanProperties({ rowIndex, colIndex })
				const cellValue = row[header.accessor] !== undefined ? row[header.accessor] : ''
				const value = header.cellRenderer
					? (header.cellRenderer({ row, column: header }) as any)
					: formatCellValue(cellValue)

				_cells.push({
					colSpan: spanInfo?.colSpan,
					rowSpan: spanInfo?.rowSpan,
					value: value,
				})
				return _cells
			}, [] as GridCell[])

			if (selection) {
				const isSelectable = selection.canSelect ? selection.canSelect(row) : true
				if (isSelectable) {
					const selected = apiRef.current.isRowSelected(row[selection.key])
					//Bind the rowSelection
					cells[cells.length - 1] = {
						value: (
							<Checkbox
								className={selection.checkboxClass}
								checked={selected}
								onClick={() => apiRef.current.selectRow(row[selection.key])}
							/>
						),
					}
				}
			}

			list[rowIndex] = cells
			return list
		}, [] as GridCell[][])

		return insertDummyCells(cellsList) as GridCell[][]
	}

	const [data, setData] = useState<GridCell[][]>([])

	useEffect(() => {
		const updatedData = buildData()
		if (!updatedData) {
			return
		}
		setData(updatedData)
	}, [rows, headers, apiRef, selection, initialised])

	const onRowSelectionChange = useCallback(() => {
		const updatedData = buildData()
		if (!updatedData) {
			return console.log('No data returned')
		}
		setData(updatedData)
	}, [apiRef, initialised])

	const getRows = useCallback(() => rows, [rows])
	const getRowsCount = useCallback(() => rows.length, [rows])

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
