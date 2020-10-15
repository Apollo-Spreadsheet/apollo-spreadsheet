import { Header } from 'columnGrid/types/header.type'
import { MergeCell } from '../../../src/mergeCells/interfaces/merge-cell'

export const createMergeCellsData = (rows: any[], headers: Header[]) => {
	if (rows === undefined || rows.length === 0) {
		return []
	}
	const mergeCells: MergeCell[] = []

	const firstRow = rows[0]
	let lastDelId = firstRow.deliverableId
	let lastWpId = firstRow.wpId
	let lastActId = firstRow.activityId
	let delRow = 0
	let wpRow = 0
	let actRow = 0

	const delIndex = headers.findIndex(e => e!.id === 'deliverable')
	const wpIndex = headers.findIndex(e => e!.id === 'wp')
	const actIndex = headers.findIndex(e => e!.id === 'activity')

	for (let i = 1; i <= rows.length; i++) {
		if (i < rows.length) {
			//DifferentDeliverable
			if (delIndex !== -1 && rows[i].deliverableId !== lastDelId) {
				if (i > delRow + 1) {
					//means we have a rowSpan
					mergeCells.push({
						rowIndex: delRow,
						colIndex: delIndex,
						rowSpan: i - delRow,
						colSpan: 1,
					})
				}
				lastDelId = rows[i].deliverableId
				delRow = i
			}
			//DifferentWP
			if (wpIndex !== -1 && rows[i].wpId !== lastWpId) {
				if (i > wpRow + 1) {
					//means we have a rowSpan
					mergeCells.push({
						rowIndex: wpRow,
						colIndex: wpIndex,
						rowSpan: i - wpRow,
						colSpan: 1,
					})
				}
				lastWpId = rows[i].wpId
				wpRow = i
			}
			//DifferentDeliverable
			if (actIndex !== -1 && rows[i].activityId !== lastActId) {
				if (i > actRow + 1) {
					//means we have a rowSpan
					mergeCells.push({
						rowIndex: actRow,
						colIndex: 2,
						rowSpan: i - actRow,
						colSpan: 1,
					})
				}
				lastActId = rows[i].activityId
				actRow = i
			}
		} else {
			if (delIndex !== -1 && i > delRow + 1) {
				//means we have a rowSpan
				mergeCells.push({
					rowIndex: delRow,
					colIndex: 0,
					rowSpan: i - delRow,
					colSpan: 1,
				})
			}
			if (wpIndex !== -1 && i > wpRow + 1) {
				//means we have a rowSpan
				mergeCells.push({ rowIndex: wpRow, colIndex: 1, rowSpan: i - wpRow, colSpan: 1 })
			}
			if (actIndex !== -1 && i > actRow + 1) {
				//means we have a rowSpan
				mergeCells.push({
					rowIndex: actRow,
					colIndex: 2,
					rowSpan: i - actRow,
					colSpan: 1,
				})
			}
		}
	}
	return mergeCells
}
