import {isIndexOutOfBoundaries} from "../utils";

describe('Navigation utils',  () => {
	describe('isIndexOutOfBoundaries', () => {
		it('should be within the boundaries', () => {
			expect(isIndexOutOfBoundaries(10, 0, 20))
			expect(isIndexOutOfBoundaries(0, 0, 5))
			expect(isIndexOutOfBoundaries(5, 0, 20))
		})

		it('should be outside minimum', () => {
			expect(isIndexOutOfBoundaries(-1, 0, 5))
			expect(isIndexOutOfBoundaries(0, 1, 10))
		})

		it('should be outside maximum', () => {
			expect(isIndexOutOfBoundaries(10, 9, 10))
			expect(isIndexOutOfBoundaries(3, 0, 2))
		})
	})
});