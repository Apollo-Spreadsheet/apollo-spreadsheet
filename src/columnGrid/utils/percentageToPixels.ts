/**
 * Converts the percentage value into pixels relying on the container width
 * @param value
 * @param containerWidth
 */
export const percentageToPixels = (value: number, containerWidth: number) =>
	(value * containerWidth) / 100
