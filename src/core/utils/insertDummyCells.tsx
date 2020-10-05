import React from 'react'
import { DummyBuffer } from './dummy-buffer'

/**
 * Requires a re-write due to flatMap, unknown types and the data not being passed
 * with interface and as row(with cells)
 * @param data
 */
export function insertDummyCells(data: any[] = []) {
	const dummyBuffer = new DummyBuffer()
	return data.map((row: any) => {
		let lastRowSpanI = -1
		let finalCellIndex = 0

		const cells = row.flatMap((col, colIndex) => {
			const arr: any[] = []

			// consume from buffer
			arr.push(...dummyBuffer.extract(finalCellIndex))

			// add dummy cell data to buffer for future rows to extract
			if (col.rowSpan > 1) {
				const parentData = {
					remainingRows: col.rowSpan - 1,
					parent: col,
				}

				let bufferKey = finalCellIndex
				if (lastRowSpanI !== -1 && row[colIndex - 1].rowSpan > 1) {
					bufferKey = lastRowSpanI
				} else {
					lastRowSpanI = finalCellIndex
				}

				const dummiesToPush = col.colSpan || 1
				const dummiesArray: any[] = []

				for (let i = 0; i < dummiesToPush; i += 1) {
					dummiesArray.push({ ...parentData })
				}

				dummyBuffer.insert(bufferKey, dummiesArray)
			}

			arr.push({
				...col,
			})

			if (col.colSpan > 1) {
				const totalDummies = col.colSpan - 1
				const dummies = [...Array(totalDummies).keys()].map((_, index) =>
					dummyBuffer.generateDummy({
						parent: col,
						index,
						totalDummies,
						dummyFor: 'colSpan',
					}),
				)

				arr.push(...dummies)
			}

			finalCellIndex += arr.length

			return arr
		})

		// buffer has data for next cell
		cells.push(...dummyBuffer.extract(finalCellIndex))

		return cells
	})
}
