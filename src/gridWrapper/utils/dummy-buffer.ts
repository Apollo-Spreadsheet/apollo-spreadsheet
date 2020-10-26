import React from 'react'

interface IGenerateDummyData {
	parent: any
	index: number
	totalDummies: number
	dummyFor: 'rowSpan' | 'colSpan'
	colSpan?: number
	rowSpan?: number
}

/**
 * DummyCell is a type used for the insert of dummy cells but there
 * are required properties that are marked as optional here in order to allow
 * default columns to be mixed into insert dummy cells method
 */
export interface DummyCell {
	colSpan?: number
	rowSpan?: number
	value?: string
	dummy?: boolean
	dummyFor?: 'rowSpan' | 'colSpan'
	first?: boolean
	last?: boolean
	style?: React.CSSProperties
}

export interface BufferedRecord {
	remainingRows: number
	parent: {
		rowSpan: number
	}
}

/**
 * DummyBuffer generates dummy cells for merged cells (col or row spans)
 * @todo Missing unit tests
 * @todo Interfaces need a better refactor and concept on what's really needed
 * @todo Use union types to avoid creating new interfaces and inherit its types
 */
export class DummyBuffer {
	private readonly _buffer = new Map<number, BufferedRecord[]>()

	/**
	 * @param parent
	 * @param index
	 * @param totalDummies
	 * @param dummyFor
	 */
	generateDummy({ parent, index, totalDummies, dummyFor, colSpan, rowSpan }: IGenerateDummyData) {
		const style: React.CSSProperties = {}
		const first = index === 0
		const last = index === totalDummies - 1

		/** @todo Review this part, we might only provide a className with theme to indicate whether its the last
		 * column or last row or even for spanns, the user might want to do something about it **/
		if (dummyFor === 'colSpan') {
			style.borderLeft = 0
			if (!last) {
				style.borderRight = 0
			}
		} else {
			style.borderTop = 0
			if (!last) {
				style.borderBottom = 0
			}
		}

		return {
			...parent,
			colSpan,
			rowSpan,
			value: '',
			dummy: true,
			dummyFor,
			first,
			last,
			style: {
				...parent.style,
				...style,
			},
		} as DummyCell
	}

	insert(key: number, arr: BufferedRecord[]) {
		if (this._buffer.has(key)) {
			this._buffer.get(key)?.push(...arr)
		} else {
			this._buffer.set(key, arr)
		}
	}

	extract(index: number) {
		const arr: DummyCell[] = []

		if (!this._buffer.has(index) || this._buffer.get(index)?.length === 0) {
			return arr
		}

		this._buffer.get(index)?.forEach(item => {
			if (!item.remainingRows) {
				return
			}

			arr.push(
				this.generateDummy({
					parent: item.parent,
					totalDummies: item.parent.rowSpan - 1,
					index: item.parent.rowSpan - 1 - item.remainingRows,
					dummyFor: 'rowSpan',
					rowSpan: 1,
				}),
			)

			item.remainingRows -= 1
		})

		return arr
	}
}
