import { percentageToPixels } from "../utils"

describe('percentageToPixels()', () => {
	it('should parse to pixels according to the containerWidth', () => {
		expect(percentageToPixels(10, 100)).toEqual(10)
		expect(percentageToPixels(1, 100)).toEqual(1)
		expect(percentageToPixels(10, 1000)).toEqual(100)
		expect(percentageToPixels(25, 1080)).toEqual(270)
	})
})