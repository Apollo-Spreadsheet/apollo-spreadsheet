import { formatCellValue } from './formatCellValue'
import { GridCell } from '../gridWrapper/interfaces/gridCell'
import { Checkbox } from '@material-ui/core'
import { insertDummyCells } from '../gridWrapper/utils/insertDummyCells'
import { Header } from '../columnGrid/types/header.type'
import { SelectionProps } from '../rowSelection/selectionProps'
import React from 'react'
import { ApiRef } from '../api/types/apiRef'

interface CreateDataParams<TRow = any> {
	apiRef: ApiRef
	headers: Header[]
	selection?: SelectionProps<TRow>
}

export function createData({
	headers,
	selection,
	apiRef,
}: CreateDataParams) {
	const cellsList = apiRef.current.getRows().reduce((list: any[], row: any, rowIndex) => {
		const cells = headers.reduce((_cells, header, colIndex) => {
			const isDummy = apiRef.current.isMerged({ rowIndex, colIndex })
			if (isDummy) {
				return _cells
			}

			const spanInfo = apiRef.current.getSpanProperties({ rowIndex, colIndex })
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
