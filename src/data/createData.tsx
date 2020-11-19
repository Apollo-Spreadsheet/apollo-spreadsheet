import { formatCellValue } from './formatCellValue'
import { GridCell } from '../gridWrapper/interfaces'
import { Checkbox } from '@material-ui/core'
import { insertDummyCells } from '../gridWrapper/utils'
import { SelectionProps } from '../rowSelection'
import React from 'react'
import { ApiRef } from '../api/types'
import { Row } from '../types'
import { isFunctionType } from '../helpers'

interface CreateDataParams {
	rows: Row[]
	apiRef: ApiRef
	selection?: SelectionProps
}

export function createData({ selection, apiRef, rows }: CreateDataParams) {
	const columns = apiRef.current.getColumns()
	const cellsList = rows.reduce((list: GridCell[][], row: Row, rowIndex) => {
		const updatedList = [...list]
		const cells = columns.reduce((_cells, column, colIndex) => {
			const isDummy = apiRef.current.isMerged({ rowIndex, colIndex })
			if (isDummy) {
				return _cells
			}

			const spanInfo = apiRef.current.getSpanProperties({ rowIndex, colIndex })
			const cellValue = row[column.accessor] !== undefined ? row[column.accessor] : ''
			const value = column.cellRenderer
				? column.cellRenderer({ row, column })
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
							className={
								isFunctionType(selection.checkboxClass)
									? selection.checkboxClass({ row, column: columns[columns.length - 1] })
									: selection.checkboxClass
							}
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
