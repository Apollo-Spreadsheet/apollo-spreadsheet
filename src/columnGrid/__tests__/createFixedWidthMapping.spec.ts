import { createColumnWidthsMapping } from "../utils"
import { StretchMode } from "../../types"
import { createColumnMock } from '../__mocks__/column-mock'
import { Column } from "../types";

describe('createFixedWidthMapping()', () => {
	it('should return an empty map and total size as 0', () => {
		const expected = {
			totalSize: 0,
			mapping: {},
		}
		const result = createColumnWidthsMapping([], 0, 0, StretchMode.None)
		expect(result).toEqual(expected)
	})

	it('should create a fixed column out of 2 columns without stretching', () => {
		const columns: Column[] = [
			createColumnMock({
				width: '200',
			}),
			createColumnMock(),
		]
		const expected = {
			totalSize: 200,
			mapping: {
				0: 200,
			},
		}
		const result = createColumnWidthsMapping(columns, 1000, 10, StretchMode.None)
		expect(result).toEqual(expected)
	})

	it('should remove the scroll width from the total container width (All columns filled)', () => {
		const columns: Column[] = [
			createColumnMock({
				width: '950',
			}),
			createColumnMock({ width: '20' }),
		]
		const expected = {
			totalSize: 970,
			mapping: {
				0: 950,
				1: 20,
			}
		}
		//Total = 955 and column uses 950 but 5 are reversed to scroll so the other column must be at 0
		const result = createColumnWidthsMapping(columns, 975, 10, StretchMode.All)
		expect(result).toEqual(expected)
	})

	it('should not create an entry when the result is less than the minimum width column', () => {
		const columns: Column[] = [
			createColumnMock({
				width: '450',
			}),
			createColumnMock({ width: '1%' }),
		]
		const expected = {
			totalSize: 450,
			mapping: {
				0: 450,
			},
		}
		const result = createColumnWidthsMapping(columns, 500, 100, StretchMode.None)
		expect(result).toEqual(expected)
	})

	describe('Stretching tests', () => {
		it('should not do any stretch when a column width is not specified ', () => {
			const columns: Column[] = [
				createColumnMock({
					width: '10',
				}),
				createColumnMock(),
			]
			const expected = { totalSize: 10, mapping: { 0: 10 } }
			const resultOfAll = createColumnWidthsMapping(columns, 200, 5, StretchMode.All)
			const resultOfLast = createColumnWidthsMapping(columns, 200, 5, StretchMode.Last)
			const resultOfNone = createColumnWidthsMapping(columns, 200, 5, StretchMode.None)
			expect(resultOfAll).toEqual(expected)
			expect(resultOfLast).toEqual(expected)
			expect(resultOfNone).toEqual(expected)
		})

		it('[StretchMode.None] should return the amount left of width and not apply in any column', () => {
			const columns: Column[] = [
				createColumnMock({
					width: '450',
				}),
			]
			const containerWidth = 500
			const expected = {
				totalSize: 450,
				mapping: {
					0: 450,
				},
			}
			const result = createColumnWidthsMapping(columns, containerWidth, 1, StretchMode.None)
			expect(result).toEqual(expected)
		})

		it('[StretchMode.All] should return equal distribution width', () => {
			const columns: Column[] = [
				createColumnMock({ width: '100' }),
				createColumnMock({ width: '100' }),
			]
			const containerWidth = 300
			const expected = {
				totalSize: 300,
				mapping: {
					0: 150,
					1: 150,
				},
			}
			const result = createColumnWidthsMapping(columns, containerWidth, 1, StretchMode.All)
			expect(result).toEqual(expected)
		})

		it('[StretchMode.All] should limit the column width distribution when it overflows the containerWidth', () => {
			//Overflow with forced widths
			const columns: Column[] = [
				createColumnMock({ width: '200' }),
				createColumnMock({ width: '200' }),
			]
			const containerWidth = 300
			const expected = {
				totalSize: 300,
				mapping: {
					0: 200,
					1: 200,
				},
			}
			const result = createColumnWidthsMapping(columns, containerWidth, 1, StretchMode.All)
			expect(result).toEqual(expected)
		})

		it('[StretchMode.Last] should apply the remaining column width to the last column', () => {
			const columns: Column[] = [
				createColumnMock({ width: '100' }),
				createColumnMock({ width: '100' }),
			]
			const containerWidth = 300
			const expected = {
				totalSize: 300,
				mapping: {
					0: 100,
					1: 200,
				},
			}
			const result = createColumnWidthsMapping(columns, containerWidth, 1, StretchMode.Last)
			expect(result).toEqual(expected)
		})
	})
})