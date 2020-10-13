import { createFixedWidthMapping } from '../utils/createFixedWidthMapping'
import { StretchMode } from '../../types/stretch-mode.enum'
import { Header } from '../types/header.type'
import { createColumnMock } from '../__mocks__/column-mock'

describe('createFixedWidthMapping()', () => {
	it('should return an empty map and total size as 0', () => {
		const expected = {
			totalSize: 0,
			mapping: {},
		}
		const result = createFixedWidthMapping([], 0, 0, StretchMode.None, 0)
		expect(result).toEqual(expected)
	})

	it('should create a fixed column out of 2 columns without stretching', () => {
		const columns: Header[] = [
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
		const result = createFixedWidthMapping(columns, 1000, 10, StretchMode.None, 0)
		expect(result).toEqual(expected)
	})

	it('should remove the scroll width from the total container width (All columns filled)', () => {
		const columns: Header[] = [
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
		const result = createFixedWidthMapping(columns, 975, 10, StretchMode.All, 5)
		expect(result).toEqual(expected)
	})

	it('should not create an entry when the result is less than the minimum width column', () => {
		const columns: Header[] = [
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
		const result = createFixedWidthMapping(columns, 500, 100, StretchMode.None, 0)
		expect(result).toEqual(expected)
	})

	describe('Stretching tests', () => {
		it('should not do any stretch when a column width is not specified ', () => {
			const columns: Header[] = [
				createColumnMock({
					width: '10',
				}),
				createColumnMock(),
			]
			const expected = { totalSize: 10, mapping: { 0: 10 } }
			const resultOfAll = createFixedWidthMapping(columns, 200, 5, StretchMode.All, 0)
			const resultOfLast = createFixedWidthMapping(columns, 200, 5, StretchMode.Last, 0)
			const resultOfNone = createFixedWidthMapping(columns, 200, 5, StretchMode.None, 0)
			expect(resultOfAll).toEqual(expected)
			expect(resultOfLast).toEqual(expected)
			expect(resultOfNone).toEqual(expected)
		})

		it('[StretchMode.None] should return the amount left of width and not apply in any column', () => {
			const columns: Header[] = [
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
			const result = createFixedWidthMapping(columns, containerWidth, 1, StretchMode.None, 0)
			expect(result).toEqual(expected)
		})

		it('[StretchMode.All] should return equal distribution width', () => {
			const columns: Header[] = [
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
			const result = createFixedWidthMapping(columns, containerWidth, 1, StretchMode.All, 0)
			expect(result).toEqual(expected)
		})

		it('[StretchMode.All] should limit the column width distribution when it overflows the containerWidth', () => {
			//Overflow with forced widths
			const columns: Header[] = [
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
			const result = createFixedWidthMapping(columns, containerWidth, 1, StretchMode.All, 0)
			expect(result).toEqual(expected)
		})

		it('[StretchMode.Last] should apply the remaining column width to the last column', () => {
			const columns: Header[] = [
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
			const result = createFixedWidthMapping(columns, containerWidth, 1, StretchMode.Last, 0)
			expect(result).toEqual(expected)
		})
	})
})