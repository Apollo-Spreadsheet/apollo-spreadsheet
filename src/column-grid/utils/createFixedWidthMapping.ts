import {parseColumnWidthsConfiguration} from "./parseColumnWidthsConfiguration"
import {FixedColumnWidthRecord} from "../types/fixed-column-width-record"
import {Column} from "../types/header.type"
import {StretchMode} from "../../types/stretch-mode.enum"

/**
 * Creates an object indexing the fixed column widths by its index as key for fast lookup on dynamic widths
 * @param columns
 * @param containerWidth
 * @param minColumnWidth
 * @param stretchMode
 */
export const createFixedWidthMapping = (columns: Column[], containerWidth: number, minColumnWidth: number, stretchMode: StretchMode, scrollWidth: number) => {
	const mapping = columns.reduce((acc, e, i) => {
		if (!e.width) {
			return acc
		}
		const value = parseColumnWidthsConfiguration(e.width, containerWidth)
		//Avoid creating an entry because react-virtualized grid will use the minimum width
		if (value < minColumnWidth){
			return acc
		}
		acc[i] = value
		return acc
	}, {} as FixedColumnWidthRecord)

	const isAllColWidthsFilled = columns.filter(e => e.width).length === columns.length
	let totalSize = Object.values(mapping).reduce((acc, e) => acc + e, 0)
	//Loop over the new mapping and adjust
	const remainingSize = Math.max(0, Math.max(0, (containerWidth - scrollWidth)) - totalSize)
	//We might have a margin that some width is left
	if (isAllColWidthsFilled && totalSize < containerWidth) {
		//Add the remaining size into the last
		if (stretchMode === StretchMode.Last) {
			const last = Object.keys(mapping).pop()
			if (last) {
				mapping[last] += remainingSize

				//Update the total size because it has been incremented
				totalSize = Object.values(mapping).reduce((acc, e) => acc + e, 0)
			}
		}

		//Add a ratio to every column with the remaining
		if (stretchMode === StretchMode.All) {
			const ratio = remainingSize / columns.length
			for (const key in mapping) {
				mapping[key] += ratio
			}
			//Update the total size because the calculated values have been updated
			totalSize = Object.values(mapping).reduce((acc, e) => acc + e, 0)
		}
	}

	//Add a fallback to prevent overflow which might be possible using rounding numbers
	if (totalSize > containerWidth) {
		totalSize = containerWidth - scrollWidth
	}

	return {
		totalSize,
		mapping
	}
}