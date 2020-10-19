import React, { useMemo } from 'react'
import { Header } from '../columnGrid/types/header.type'
import { MergeCell } from '../mergeCells/interfaces/merge-cell'
import { Checkbox } from '@material-ui/core'
import { SelectionProps } from '../rowSelection/selectionProps'
import { GridCell } from '../gridWrapper/interfaces/gridCell'
import { insertDummyCells } from '../gridWrapper/utils/insertDummyCells'
import { formatCellValue } from './formatCellValue'
import { NavigationCoords } from '../navigation/types/navigation-coords.type'

interface Props<Row> {
	rows: Row[]
	headers: Header[]
	getSpanProperties: (coords: NavigationCoords) => MergeCell | undefined
	isMerged: (coords: NavigationCoords) => boolean
	isRowSelected: (rowId: string) => boolean
	selectRow: (rowId: string) => void
	selection?: SelectionProps<Row>
}

/**
 * useData transforms the given data/rows into cells for internal usage and validates but also provides utilities
 */
export function useData<Row = any>({
	rows,
	headers,
	getSpanProperties,
	isMerged,
	isRowSelected,
	selectRow,
	selection,
}: Props<Row>) {
	const data = useMemo(() => {
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
					const selected = isRowSelected(row[selection.key])
					//Bind the rowSelection
					cells[cells.length - 1] = {
						value: (
							<Checkbox
								className={selection.checkboxClass}
								checked={selected}
								onClick={() => selectRow(row[selection.key])}
							/>
						),
					}
				}
			}

			list[rowIndex] = cells
			return list
		}, [] as GridCell[][])

		return insertDummyCells(cellsList) as GridCell[][]
	}, [rows, headers, getSpanProperties, isRowSelected, selectRow, selection, isMerged])

	return { data }
}
