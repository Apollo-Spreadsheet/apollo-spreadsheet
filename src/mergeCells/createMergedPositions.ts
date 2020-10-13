import { MergeCell } from './interfaces/merge-cell'

export interface MergePosition {
	row: number
	col: number
}

/**
 * Creates the list of cells merged which are "dummy cells" and returns them
 * for future lookup
 * @param data
 */
export function createMergedPositions(data: MergeCell[]) {
	const mergedPositions: MergePosition[] = []
	for (const e of data) {
		const ranges = {
			rowStart: e.rowIndex + 1,
			rowEnd: e.rowIndex + Math.max(0, e.rowSpan - 1),
			colStart: e.colIndex,
			colEnd: e.colIndex + Math.max(0, e.colSpan - 1),
		}

		for (let i = ranges.rowStart; i <= ranges.rowEnd; i++) {
			for (let j = ranges.colStart; j <= ranges.colEnd; j++) {
				mergedPositions.push({ row: i, col: j })
			}
		}
	}
	return mergedPositions
}
