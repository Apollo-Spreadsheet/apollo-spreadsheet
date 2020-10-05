import React from 'react'
import { CellMeasurer } from 'react-virtualized'
import { CellMeasureWrapperProps } from './cellMeasureWrapperProps'
import { getMaxSum } from './utils/getMaxSum'

const CellMeasureWrapper = React.memo(
	({ rowSpan, colSpan, cellRenderer, rendererProps, style, ...props }: CellMeasureWrapperProps) => {
		const initializeStyles = () => {
			const defaultStyle: React.CSSProperties = {
				transform: 'translate3d(0, 0, 0)',
				alignItems: 'center',
				overflow: 'hidden',
				wordBreak: 'break-word',
				textOverflow: 'ellipsis',
				textAlign: 'center',
			}

			//Ensure it is 1 by default in case we have none
			if (!rowSpan) {
				rowSpan = 1
			}
			if (!colSpan) {
				colSpan = 1
			}

			const { rowIndex, cache } = props

			if (rowSpan === 1 && colSpan === 1) {
				return style ? ({ ...style, ...defaultStyle } as React.CSSProperties) : defaultStyle
			}

			const rowGenerator = row => cache.rowHeight({ index: rowIndex + row })
			//Retrieve dynamically to calculate colSpan if needed
			const columnWidth = rendererProps.getColumnWidth({ index: props.columnIndex })

			const rowSpanStyle =
				rowSpan === 1
					? {}
					: {
							/** @todo Missing an edge case of the last row to cover or even if its not the last
							 * it is not evaluating when it has only a child or too and it expands twice the size leaving a big empty space
							 */
							height: getMaxSum(rowGenerator, rowSpan),
					  }
			const colSpanStyle =
				colSpan === 1
					? {}
					: {
							width: columnWidth * colSpan,
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
	},
)

export default CellMeasureWrapper
