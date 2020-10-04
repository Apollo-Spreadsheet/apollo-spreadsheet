import React from 'react'

interface IGenerateDummyData {
	parent: any
	index: number
	totalDummies: number
	dummyFor: 'rowSpan' | 'colSpan'
}

/**
 * DummyBuffer generates dummy cells for merged cells (col or row spans)
 */
export class DummyBuffer {
	private readonly _buffer = new Map<number, any>()

	/**
	 * @param parent
	 * @param index
	 * @param totalDummies
	 * @param dummyFor
	 */
	generateDummy({ parent, index, totalDummies, dummyFor }: IGenerateDummyData) {
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
			colSpan: 1,
			rowSpan: 1,
			children: '',
			dummy: true,
			dummyFor,
			first,
			last,
			style: {
				...parent.style,
				...style,
			},
			parentRow: parent /** @todo We might only need the id in the future or the index */,
		}
	}

	insert(key: number, arr) {
		if (this._buffer.has(key)) {
			this._buffer.get(key).push(...arr)
		} else {
			this._buffer.set(key, arr)
		}
	}

	extract(index: number) {
		const arr: any[] = []

		if (!this._buffer.has(index) || this._buffer.get(index).length === 0) {
			return arr
		}

		this._buffer.get(index).forEach(item => {
			if (!item.remainingRows) {
				return
			}

			arr.push(
				this.generateDummy({
					parent: item.parent,
					totalDummies: item.parent.rowSpan - 1,
					index: item.parent.rowSpan - 1 - item.remainingRows,
					dummyFor: 'rowSpan',
				}),
			)

			// eslint-disable-next-line no-param-reassign
			item.remainingRows -= 1
		})

		return arr
	}
}
