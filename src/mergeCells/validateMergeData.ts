import {
	containsNegativeValues,
	isOutOfBounds,
	isOverlapping,
	isSingleCell,
	isZeroSpan,
} from './validators'
import { MergeCell } from './interfaces/merge-cell'
import {
	MERGED_DUPLICATED,
	MERGED_NEGATIVE_VALUES,
	MERGED_OUT_OF_BONDS,
	MERGED_OVERLAP,
	MERGED_SINGLE_CELL,
	MERGED_ZERO_SPAN,
} from './validationErrorMessages'

export function validateMergeData(data: MergeCell[], rowCount: number, columnCount: number) {
	const validData: MergeCell[] = []
	for (const e of data) {
		if (containsNegativeValues(e)) {
			console.error(MERGED_NEGATIVE_VALUES(e))
			continue
		}

		if (isOutOfBounds(e, rowCount, columnCount)) {
			console.error(MERGED_OUT_OF_BONDS(e))
			continue
		}

		if (isSingleCell(e)) {
			console.error(MERGED_SINGLE_CELL(e))
			continue
		}

		if (isZeroSpan(e)) {
			console.error(MERGED_ZERO_SPAN(e))
			continue
		}

		if (validData.some(x => x.rowIndex === e.rowIndex && x.colIndex === e.colIndex)) {
			console.error(MERGED_DUPLICATED(e))
			continue
		}

		if (isOverlapping(e, validData)) {
			console.error(MERGED_OVERLAP(e))
			continue
		}

		validData.push(e)
	}

	return validData
}
