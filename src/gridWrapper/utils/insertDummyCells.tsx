import React from 'react'
import { BufferedRecord, DummyBuffer, DummyCell } from './dummy-buffer'
import flatMap from 'lodash/flatMap'

/**
 * Requires a re-write due to flatMap, unknown types and the data not being passed
 * with interface and as row(with cells)
 * @param data
 */
export function insertDummyCells<Row extends { rowSpan?: number; colSpan?: number }>(
	data: Row[][] = [],
) {
	const dummyBuffer = new DummyBuffer()
	return data.map(row => {
		let lastRowSpanI = -1
		let finalCellIndex = 0

		const cells = flatMap(row, (col, colIndex) => {
			const arr: DummyCell[] = []

			// consume from buffer
			arr.push(...dummyBuffer.extract(finalCellIndex))

			// add dummy cell data to buffer for future rows to extract
			if (col.rowSpan && col.rowSpan > 1) {
				const parentData = {
					remainingRows: col.rowSpan - 1,
					parent: {
						rowSpan: col.rowSpan ?? 1,
					},
				}

				let bufferKey = finalCellIndex
				const lastRowSpan = row[colIndex - 1]?.rowSpan
				if (lastRowSpanI !== -1 && lastRowSpan && lastRowSpan > 1) {
					bufferKey = lastRowSpanI
				} else {
					lastRowSpanI = finalCellIndex
				}

				const dummiesToPush = col.colSpan || 1
				const dummiesArray: BufferedRecord[] = []

				for (let i = 0; i < dummiesToPush; i++) {
					dummiesArray.push({ ...parentData })
				}

				dummyBuffer.insert(bufferKey, dummiesArray)
			}

			//Bind the default column
			arr.push({
				...col,
			})

			if (col.colSpan && col.colSpan > 1) {
				const totalDummies = col.colSpan - 1
				const dummies = [...Array(totalDummies).keys()].map((_, index) =>
					dummyBuffer.generateDummy({
						parent: col,
						index,
						totalDummies,
						dummyFor: 'colSpan',
						colSpan: 1,
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
	}) as any[][]
}
