import React from 'react'
import { CellMeasurer } from 'react-virtualized'
import { CellMeasureWrapperProps } from './cellMeasureWrapperProps'
import { getMaxSum } from './utils/getMaxSum'

function CellMeasureWrapper ({ rowSpan, colSpan, cellRenderer, rendererProps, style, ...props }: CellMeasureWrapperProps) {
		const initializeStyles = () => {
			const defaultStyle: React.CSSProperties = {
				transform: 'translate3d(0, 0, 0)',
				alignItems: 'center',
				overflow: 'hidden',
				wordBreak: 'break-word',
				textAlign: 'center',
			}
			const { rowIndex, cache } = props
			if (!rowSpan && !colSpan) {
				return style ? ({ ...style, ...defaultStyle } as React.CSSProperties) : defaultStyle
			}

			const rowGenerator = row => cache.rowHeight({ index: rowIndex + row })

			const rowSpanStyle = !rowSpan
				? {}
				: {
						/** @todo Missing an edge case of the last row to cover or even if its not the last
						 * it is not evaluating when it has only a child or too and it expands twice the size leaving a big empty space
						 */
						height: getMaxSum(rowGenerator, rowSpan),
				  }

			//Fetch all column widths and sum into a unique value
			const buildSpanColumnWidth = (spanSize: number) => {
				let value = 0
				const lastIndex = props.columnIndex + spanSize
				for (let i = props.columnIndex; i < lastIndex; i++) {
					value += rendererProps.getColumnWidth({ index: i })
				}
				return value
			}

			const colSpanStyle = !colSpan
				? {}
				: {
						width: buildSpanColumnWidth(colSpan),
				  }

			const _style: React.CSSProperties = {
				...style,
				...defaultStyle,
				...rowSpanStyle,
				...colSpanStyle,
				zIndex: 1,
			}

			return _style
		}

		const spanningStyle = initializeStyles()
		return (
			<CellMeasurer {...props}>
				{({ registerChild }) =>
					cellRenderer({
						...rendererProps,
						style: spanningStyle,
						ref: registerChild,
					})
				}
			</CellMeasurer>
		)
}

export default CellMeasureWrapper
