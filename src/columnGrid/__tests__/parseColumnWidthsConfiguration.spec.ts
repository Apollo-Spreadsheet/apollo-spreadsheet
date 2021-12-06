import { parseColumnWidthsConfiguration } from '../utils/parseColumnWidthsConfiguration'

describe('parseColumnWidthsConfiguration()', () => {
	it('should parse px into number', () => {
		expect(parseColumnWidthsConfiguration('1 px', 100)).toEqual(1)
		expect(parseColumnWidthsConfiguration('30px', 100)).toEqual(30)
	})

	it('should parse % into number', () => {
		expect(parseColumnWidthsConfiguration('10 %', 100)).toEqual(10)
		expect(parseColumnWidthsConfiguration('20%', 100)).toEqual(20)
	})

	it('should return the number without additional parse', () => {
		const result = parseColumnWidthsConfiguration(1, 100)
		expect(result).toBe(1)
	})

	it('should return the container width if it overflows', () => {
		expect(parseColumnWidthsConfiguration(200, 100)).toEqual(100)
	})
	it('should throw error with invalid value', () => {
		expect(() => {
			parseColumnWidthsConfiguration("abcd", 100)
		}).toThrowError()
		expect(() => {
			parseColumnWidthsConfiguration("1234%", 100)
		}).toThrowError()
		expect(() => {
			parseColumnWidthsConfiguration("abcpx", 100)
		}).toThrowError()
	})
})