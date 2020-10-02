/**
 * Converts the percentage value into pixels relying on the container width
 * @param value
 * @param containerWidth
 */
export const percentageToPixels = (value: number, containerWidth: number) => {
	return (value * containerWidth) / 100 //TODO not sure if i use math.floor
}