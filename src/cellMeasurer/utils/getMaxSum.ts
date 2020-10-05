interface GeneratorFn {
	(index: number): number
}

/**
 * Returns a new array with the keys of the given array
 * @param n
 */
const generateArr = (n: number) => [...Array(n).keys()]

/**
 * Returns the sum of all array objects, used to sum the height of all rows within a space to get the highest
 * when we have merged cell
 * @param generator
 * @param spanSize
 */
export const getMaxSum = (generator: GeneratorFn, spanSize: number) =>
	generateArr(spanSize).reduce((sum, i) => sum + generator(i), 0)
