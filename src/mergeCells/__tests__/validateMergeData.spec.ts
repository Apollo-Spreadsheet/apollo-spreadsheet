import { validateMergeData } from '../validateMergeData'
import {
	MERGED_DUPLICATED,
	MERGED_NEGATIVE_VALUES,
	MERGED_OUT_OF_BONDS, MERGED_OVERLAP, MERGED_SINGLE_CELL,
	MERGED_ZERO_SPAN,
} from '../validationErrorMessages'

describe('validateMergeData()', () => {
	const consoleSpy = jest
	.spyOn(console, 'error')
	.mockImplementation(() => {
	})

	afterEach(() => {
		consoleSpy.mockClear()
	})

	it('should not allow any rowSpan without rows or colSpan without columns', () => {
		expect(validateMergeData([{ rowIndex: 2, colIndex: 1, colSpan: 2, rowSpan: 2 }], 0, 1)).toEqual([])
		expect(validateMergeData([{ rowIndex: 3, colIndex: 1, colSpan: 2, rowSpan: 2 }], 1, 0)).toEqual([])
		expect(validateMergeData([{ rowIndex: 4, colIndex: 4, colSpan: 2, rowSpan: 2 }], 0, 0)).toEqual([])

		const expectedErrors = [
			MERGED_OUT_OF_BONDS({ rowIndex: 2, colIndex: 1 }),
			MERGED_OUT_OF_BONDS({ rowIndex: 3, colIndex: 1 }),
			MERGED_OUT_OF_BONDS({ rowIndex: 4, colIndex: 4 }),
		]

		expect(consoleSpy).toBeCalled()
		expect(consoleSpy).toHaveBeenCalledTimes(expectedErrors.length)
		expect(consoleSpy.mock.calls.map(e => e[0])).toEqual(expectedErrors)
	})

	it('should not accept a duplicated configuration and pick the first entry', () => {
		expect(validateMergeData([
			{ rowIndex: 0, colIndex: 0, colSpan: 2, rowSpan: 2 },
			{ rowIndex: 0, colIndex: 0, colSpan: 2, rowSpan: 2 },
		], 5, 5)).toEqual([{ rowIndex: 0, colIndex: 0, colSpan: 2, rowSpan: 2 }])

		const expectedErrors = [
			MERGED_DUPLICATED({ rowIndex: 0, colIndex: 0 }),
		]

		expect(consoleSpy).toBeCalled()
		expect(consoleSpy).toHaveBeenCalledTimes(expectedErrors.length)
		expect(consoleSpy.mock.calls.map(e => e[0])).toEqual(expectedErrors)
	})

	it('should not return the negative values/indexes and must throw console error', () => {
		expect(validateMergeData([{ rowIndex: -1, colIndex: -1, colSpan: 0, rowSpan: 0 }], 1, 1)).toEqual([])
		expect(validateMergeData([{ rowIndex: -1, colIndex: 0, colSpan: 0, rowSpan: 0 }], 1, 1)).toEqual([])
		expect(validateMergeData([{ rowIndex: 0, colIndex: -1, colSpan: 0, rowSpan: 0 }], 1, 1)).toEqual([])
		expect(validateMergeData([{ rowIndex: 1, colIndex: 2, colSpan: -1, rowSpan: 0 }], 1, 1)).toEqual([])
		expect(validateMergeData([{ rowIndex: 1, colIndex: 2, colSpan: 0, rowSpan: -1 }], 1, 1)).toEqual([])
		expect(validateMergeData([{ rowIndex: 2, colIndex: 1, colSpan: -1, rowSpan: 0 }], 1, 1)).toEqual([])
		expect(validateMergeData([{ rowIndex: 2, colIndex: 1, colSpan: 0, rowSpan: -1 }], 1, 1)).toEqual([])
		//Send mixed, a valid and invalid
		expect(validateMergeData([
			//Send a valid
			{ rowIndex: 0, colIndex: 0, colSpan: 0, rowSpan: 3 },
			{ rowIndex: 6, colIndex: 6, colSpan: 0, rowSpan: -1 },
		], 20, 20)).toEqual([{ rowIndex: 0, colIndex: 0, colSpan: 0, rowSpan: 3 }])

		const expectedErrors = [
			MERGED_NEGATIVE_VALUES({ rowIndex: -1, colIndex: -1 }),
			MERGED_NEGATIVE_VALUES({ rowIndex: -1, colIndex: 0 }),
			MERGED_NEGATIVE_VALUES({ rowIndex: 0, colIndex: -1 }),
			MERGED_NEGATIVE_VALUES({ rowIndex: 1, colIndex: 2 }),
			MERGED_NEGATIVE_VALUES({ rowIndex: 1, colIndex: 2 }),
			MERGED_NEGATIVE_VALUES({ rowIndex: 2, colIndex: 1 }),
			MERGED_NEGATIVE_VALUES({ rowIndex: 2, colIndex: 1 }),
			MERGED_NEGATIVE_VALUES({ rowIndex: 6, colIndex: 6 }),
		]

		expect(consoleSpy).toBeCalled()
		expect(consoleSpy).toHaveBeenCalledTimes(expectedErrors.length)
		expect(consoleSpy.mock.calls.map(e => e[0])).toEqual(expectedErrors)
	})

	it('should not accept any zeroSpan (both colSpan and rowSpan set to 0)', () => {
		expect(validateMergeData([{ rowIndex: 0, colIndex: 0, colSpan: 0, rowSpan: 0 }], 1, 1)).toEqual([])
		expect(validateMergeData([
			{
				rowIndex: 0, colIndex: 0, colSpan: 0, rowSpan: 0,
			},
			{
				rowIndex: 0, colIndex: 0, colSpan: 2, rowSpan: 0,
			},
		], 1, 4)).toEqual([{
			rowIndex: 0, colIndex: 0, colSpan: 2, rowSpan: 0,
		}])

		const expectedErrors = [
			MERGED_ZERO_SPAN({ rowIndex: 0, colIndex: 0 }),
			MERGED_ZERO_SPAN({ rowIndex: 0, colIndex: 0 }),
		]

		expect(consoleSpy).toBeCalled()
		expect(consoleSpy).toHaveBeenCalledTimes(expectedErrors.length)
		expect(consoleSpy.mock.calls.map(e => e[0])).toEqual(expectedErrors)
	})

	it('should not accept any singleSpan (both colSpan and rowSpan set to 1)', () => {
		expect(validateMergeData([{ rowIndex: 0, colIndex: 0, colSpan: 1, rowSpan: 1 }], 3, 3)).toEqual([])
		expect(validateMergeData([
			{
				rowIndex: 0, colIndex: 0, colSpan: 1, rowSpan: 1,
			},
			{
				rowIndex: 0, colIndex: 0, colSpan: 0, rowSpan: 2,
			},
		], 3, 3)).toEqual([{
			rowIndex: 0, colIndex: 0, colSpan: 0, rowSpan: 2,
		}])

		const expectedErrors = [
			MERGED_SINGLE_CELL({ rowIndex: 0, colIndex: 0 }),
			MERGED_SINGLE_CELL({ rowIndex: 0, colIndex: 0 }),
		]

		expect(consoleSpy).toBeCalled()
		expect(consoleSpy).toHaveBeenCalledTimes(expectedErrors.length)
		expect(consoleSpy.mock.calls.map(e => e[0])).toEqual(expectedErrors)
	})

	it('should not accept overlapping configurations and throw a console error but accept the valid', () => {
		expect(validateMergeData([
			{ rowIndex: 0, colIndex: 1, colSpan: 3, rowSpan: 4 },
			{ rowIndex: 1, colIndex: 2, colSpan: 3, rowSpan: 4 },
			{ rowIndex: 5, colIndex: 5, colSpan: 1, rowSpan: 3 },
		], 10, 10)).toEqual([
			{ rowIndex: 0, colIndex: 1, colSpan: 3, rowSpan: 4 },
			{ rowIndex: 5, colIndex: 5, colSpan: 1, rowSpan: 3 },
		])

		const expectedErrors = [
			MERGED_OVERLAP({ rowIndex: 1, colIndex: 2 }),
		]

		expect(consoleSpy).toBeCalled()
		expect(consoleSpy).toHaveBeenCalledTimes(expectedErrors.length)
		expect(consoleSpy.mock.calls.map(e => e[0])).toEqual(expectedErrors)
	})
})