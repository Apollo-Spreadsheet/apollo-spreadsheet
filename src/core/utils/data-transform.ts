import { Column, HeadersData } from '../../columnGrid/types/header.type'
import { GridCell, GridData, Row } from '../../types/row.interface'

//Test only
export interface TestRow {
	id: string
	rowSpan?: number
	colSpan?: number
	deliverableId: string
	deliverableBody: string
	wpId: string
	wpBody: string
	activityId: string
	activityBody: string
	order: number
	taskId: string
	taskBody: string
}

export const buildCellFromHeader = (row: TestRow, columns: Column[]) => {
	const cell: any = []
	for (const col of columns) {
		if (!col.cellRenderer && !row[col.accessor]) {
			console.warn(`Could not read data from row id ${row.id} with accessor ${col.accessor}`)
		}
		const data = {
			id: `cell-${row.id}-${col.id}`,
			data: col.cellRenderer
				? col.cellRenderer({
						row,
				  })
				: row[col.accessor],
		}
		cell.push(data)
	}
	console.log('Returning')
	console.log(cell)
	return cell
}

//Test building a converted that checks for rowSpan and colSpan and removes automatically things like the fields
//that will be merged
export const rowsToCells = (rows: TestRow[], headers: HeadersData) => {
	const cells: GridData = []
	const columns = Array.isArray(headers) ? (headers[0] as Column[]) : (headers as Column[])

	//Ensure we have columns or it is a cleanup
	if (!columns || columns.length === 0) {
		return []
	}

	for (const row of rows) {
		//Check if exist and if yes we can work with that otherwise initialize
		const target = cells.some(e => e.find(e => e.id === row.id))
		if (target) {
			console.error('Target is already present')
		} else {
			//Use the headers to build the cells
			cells.push(buildCellFromHeader(row, columns))
		}
	}
	return cells
}
