import { formatCellValue } from './formatCellValue'
import { GridCell } from '../gridWrapper/interfaces'
import { Checkbox } from '@material-ui/core'
import { insertDummyCells } from '../gridWrapper/utils'
import { Column } from '../columnGrid/types'
import { SelectionProps } from '../rowSelection'
import React from 'react'
import { ApiRef } from '../api/types'
import { Row } from '../types'

interface CreateDataParams {
	rows: Row[]
	apiRef: ApiRef
	columns: Column[]
	selection?: SelectionProps
}

export function createData({ columns, selection, apiRef, rows }: CreateDataParams) {
	const cellsList = rows.reduce((list: GridCell[][], row: Row, rowIndex) => {
		const updatedList = [...list]
		const cells = columns.reduce((_cells, header, colIndex) => {
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
				value,
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

		updatedList[rowIndex] = cells
		return updatedList
	}, [] as GridCell[][])

	return insertDummyCells(cellsList as any[]) as GridCell[][]
}
