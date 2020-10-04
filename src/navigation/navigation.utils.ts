/**
 * Returns whether a given row coordinate is out of the given limit
 * @param index
 * @param min
 * @param max
 */
export const isIndexOutOfBoundaries = (index: number, min: number, max: number) => {
	return index < min || index > max
}