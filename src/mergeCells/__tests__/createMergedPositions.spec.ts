import { createMergedPositions, MergePosition } from '../createMergedPositions'
import { MergeCell } from '../interfaces/merge-cell'

describe('createMergedPositions()', () => {
	it('should return empty', () => {
		expect(createMergedPositions([])).toEqual([])
	})

	it('should create only for rowSpan', () => {
		const expected: MergePosition[] = [{
			row: 1,
			col: 0,
		}]
		const mergeCells: MergeCell[] = [{
			rowIndex: 0,
			colIndex: 0,
			rowSpan: 2,
			colSpan: 1,
		}]
		expect(createMergedPositions(mergeCells)).toEqual(expected)
	})

	it('should create entries for colSpan and rowSpan', () => {
		const expected: MergePosition[] = [{
			row: 1,
			col: 0,
		}, {
			row: 1,
			col: 1,
		}]
		const mergeCells: MergeCell[] = [{
			rowIndex: 0,
			colIndex: 0,
			rowSpan: 2,
			colSpan: 2,
		}]
		expect(createMergedPositions(mergeCells)).toEqual(expected)
	})
})