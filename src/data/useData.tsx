import React, { useMemo } from 'react'
import { Header } from '../columnGrid/types/header.type'
import { MergeCell } from '../mergeCells/interfaces/merge-cell'
import { Checkbox } from '@material-ui/core'
import { SelectionProps } from '../rowSelection/selectionProps'
import { MergePosition } from '../mergeCells/createMergedPositions'
import { GridCell } from '../gridWrapper/interfaces/gridCell'
import { insertDummyCells } from '../gridWrapper/utils/insertDummyCells'
import { formatCellValue } from './formatCellValue'

interface Props<Row> {
	rows: Row[]
	headers: Header[]
	mergeCells?: MergeCell[]
	mergedPositions?: MergePosition[]
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
	mergeCells,
	mergedPositions,
	isRowSelected,
	selectRow,
	selection,
}: Props<Row>) {
	const data = useMemo(() => {
		const cellsList = rows.reduce((list, row, i) => {
			const cells = headers.reduce((_cells, header, colIndex) => {
				const isDummy = mergedPositions?.some(e => e.row === i && e.col === colIndex)
				if (isDummy) {
					return _cells
				}

				const mergeInfo = mergeCells?.find(e => e.rowIndex === i && e.colIndex === colIndex)
				const cellValue = row[header.accessor] !== undefined ? row[header.accessor] : ''
				const value = header.cellRenderer
					? (header.cellRenderer({ row, column: header }) as any)
					: formatCellValue(cellValue)

				_cells.push({
					colSpan: mergeInfo?.colSpan,
					rowSpan: mergeInfo?.rowSpan,
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

			list[i] = cells
			return list
		}, [] as GridCell[][])

		return insertDummyCells(cellsList) as GridCell[][]
	}, [rows, headers, mergeCells, isRowSelected, selectRow, selection])

	return { data }
}
