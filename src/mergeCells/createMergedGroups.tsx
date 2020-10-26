import { MergeCell } from './interfaces/merge-cell'

export interface MergeGroup {
	[rowIndex: number]: number[]
}

/**
 * Creates the list of groups parent with all child rows
 * for future lookup
 * @param data
 */
export function createMergedGroups(data: MergeCell[]) {
	const groups: MergeGroup = []
	for (const e of data) {
		const childRows: number[] = []
		const ranges = {
			rowStart: e.rowIndex + 1,
			rowEnd: e.rowIndex + Math.max(0, e.rowSpan - 1),
			colStart: e.colIndex,
			colEnd: e.colIndex + Math.max(0, e.colSpan - 1),
		}

		for (let i = ranges.rowStart; i <= ranges.rowEnd; i++) {
			childRows.push(i)
		}
		groups[e.rowIndex] = childRows
	}
	return groups
}
