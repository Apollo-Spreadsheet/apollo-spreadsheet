import {percentageToPixels} from "./percentage-to-pixels";

/**
 * Converts the column widths from percentage or px down to pure number value (which is pixels in the end) for fixed column width configuration
 * @param value
 * @param containerWidth
 * @param minColumnWidth
 */
export const parseColumnWidthsConfiguration = (value: number | string, containerWidth: number, minColumnWidth: number) => {
	const isPercentage = typeof value === 'string' && value.includes('%')
	const isPixels = typeof value === 'string' && value.includes('px')
	//TODO If we want to support em/rem https://github.com/tysonmatanich/getEmPixels
	//TODO In case of percentage we need to validate, there are min values and max otherwise it can blow the whole app
	//now this validations depend on whether i have strech mode on or off, if i have it off then it won't matter a limit because we'll get a scroll
	//TODO Maybe we check if the provided brute value is less than the min column width, this might raise conflicts if it is
	//TODO also check if by using Math.round does not affect by overflowing the containerWidth/available width otherwise we have an issue
	if (isPercentage){
		const parsedValue = Number(value.toString().replace('%', '').trim())
		if (isNaN(parsedValue)){
			throw new Error('Provided % value for column width is invalid, review value: ' + value + " at column id " )
		}

		const result = percentageToPixels( parsedValue, containerWidth)
		if (result < minColumnWidth){
			//throw new Error('Provided value is less than the minimum col width provided/default')
		}

		return Math.round(result)
	}

	if (isPixels){
		const parsedValue = Number(value.toString().replace('px', '').trim())
		if (isNaN(parsedValue)){
			throw new Error('Provided pixel value for column width is invalid, review value: ' + value + " at column id " )
		}

		if (parsedValue < minColumnWidth){
			//throw new Error('Provided value is less than the minimum col width provided/default')
		}

		return parsedValue
	}

	if (value < minColumnWidth){
		// throw new Error('Provided value is less than the minimum col width provided/default')
	}

	return Number(value)
}