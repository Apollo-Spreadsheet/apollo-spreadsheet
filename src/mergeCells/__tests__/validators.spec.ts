import { containsNegativeValues, isOutOfBounds, isOverlapping, isSingleCell, isZeroSpan } from '../validators'

describe('mergeCells validators', () => {
	it('should handle isZeroSpan() correctly', () => {
		expect(isZeroSpan({ rowIndex: 0, colIndex: 0, colSpan: 0, rowSpan: 0 }))
	})

	it('should handle isSingleCell() correctly', () => {
		expect(isSingleCell({ rowIndex: 0, colIndex: 0, colSpan: 1, rowSpan: 1 }))
	})

	it('should handle containsNegativeValues() correctly', () => {
		expect(containsNegativeValues({ rowIndex: -1, colIndex: 0, colSpan: 0, rowSpan: 0 }))
		expect(containsNegativeValues({ rowIndex: 0, colIndex: -1, colSpan: 0, rowSpan: 0 }))
		expect(containsNegativeValues({ rowIndex: 0, colIndex: 0, colSpan: -1, rowSpan: 0 }))
		expect(containsNegativeValues({ rowIndex: 0, colIndex: 0, colSpan: 0, rowSpan: -1 }))
		expect(containsNegativeValues({ rowIndex: -1, colIndex: -1, colSpan: -1, rowSpan: -1 }))
	})

	it('should handle isOutOfBounds() correctly', () => {
		expect(isOutOfBounds({ rowIndex: 0, colIndex: 0, colSpan: 1, rowSpan: 1 }, 0, 0))
		expect(isOutOfBounds({ rowIndex: 0, colIndex: 0, colSpan: 1, rowSpan: 3 }, 1, 1))
		expect(isOutOfBounds({ rowIndex: 0, colIndex: 0, colSpan: 2, rowSpan: 4 }, 0, 0))
	})

	it('should handle isOverlapping() correctly', () => {
		expect(isOverlapping({ rowIndex: 0, colIndex: 0, rowSpan: 0, colSpan: 0 }, [])).toBe(false)
		expect(isOverlapping({ rowIndex: 0, colIndex: 0, rowSpan: 0, colSpan: 0 }, [{
			rowIndex: 1,
			colIndex: 0,
			rowSpan: 1,
			colSpan: 1,
		}])).toBe(false)
		/** @todo Review, test is failing but should pass **/
		expect(isOverlapping({ rowIndex: 0, colIndex: 0, rowSpan: 4, colSpan: 1 }, [{
			rowIndex: 0,
			colIndex: 0,
			rowSpan: 2,
			colSpan: 1,
		}])).toBe(true)
	})
})