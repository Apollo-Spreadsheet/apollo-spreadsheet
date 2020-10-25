import React, { useCallback, useRef } from 'react'
import { StretchMode } from '../types/stretch-mode.enum'
import { scrollbarWidth } from '@xobotyi/scrollbar-width'
import { AutoSizer, OnScrollParams, ScrollSync } from 'react-virtualized'
import { createFixedWidthMapping } from '../columnGrid/utils/createFixedWidthMapping'
import { FixedColumnWidthRecord } from '../columnGrid/useHeaders'
import { Column } from '../columnGrid/types/header.type'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

const useStyles = makeStyles(() => ({
	root: {
		height: '100%',
		width: '100%',
	},
}))

export interface GridContainerChildrenProps {
	width: number
	height: number
	getColumnWidth: ({ index }: { index: number }) => number
	columnGridRef: React.MutableRefObject<any>
	mainGridRef: React.MutableRefObject<any>
	scrollLeft: number
	onScroll?: (params: OnScrollParams) => any
}

export interface GridContainerCommonProps {
	height?: number
	width?: number
	containerClassName?: string
}

interface Props extends GridContainerCommonProps {
	headers: Column[]
	minColumnWidth: number
	stretchMode: StretchMode
	children: (props: GridContainerChildrenProps) => unknown
}

export const GridContainer = React.memo(
	({
		minColumnWidth,
		stretchMode,
		headers,
		children,
		width,
		height,
		containerClassName,
	}: Props) => {
		const scrollbarSize = scrollbarWidth() ?? 0
		const classes = useStyles()
		const gridContainerRef = useRef<HTMLDivElement | null>(null)
		const mainGridRef = useRef<any | null>(null)
		const columnGridRef = useRef<any | null>(null)
		const fixedColumnWidths = useRef<FixedColumnWidthRecord>({
			totalSize: 0,
			mapping: {},
		})

		/**
		 * Helper that facades with getColumnWidth function provided by react-virtualize and either returns
		 * the fixed width from our mapping or fetches directly from react-virtualize
		 * @param getColumnWidth
		 */
		const getColumnWidthHelper = (getColumnWidth?: ({ index }: { index: number }) => number) => ({
			index,
		}: {
			index: number
		}) => {
			let value = minColumnWidth
			//If we have no column width accessor than it means we only use fixed widths
			if (!getColumnWidth) {
				value = fixedColumnWidths.current.mapping[index]
			} else {
				value = fixedColumnWidths.current.mapping[index] ?? getColumnWidth({ index })
			}
			return isNaN(value) ? minColumnWidth : value
		}

		const getTotalColumnWidth = useCallback(
			(getColumnWidth?: ({ index }: { index: number }) => number) => {
				let value = 0
				for (let i = 0; i < headers.length; i++) {
					value += getColumnWidthHelper(getColumnWidth)({ index: i })
				}
				return value - scrollbarSize
			},
			[headers.length],
		)

		const calculateColumnWidths = (containerWidth: number) => {
			const { mapping, totalSize } = createFixedWidthMapping(
				headers,
				containerWidth,
				minColumnWidth,
				stretchMode,
				scrollbarSize,
			)

			//Just update with the new calculated (if it was otherwise it might have been a cached result)
			fixedColumnWidths.current = {
				totalSize,
				mapping,
			}

		}

		function render(containerWidth: number, containerHeight = 500) {
			const normalizedContainerWidth =
				stretchMode !== StretchMode.None ? containerWidth - scrollbarSize : containerWidth

			//Invoke our column builder
			calculateColumnWidths(normalizedContainerWidth)
			if (stretchMode !== StretchMode.None) {
				return (
					<>
						{children({
							width: containerWidth,
							height: containerHeight,
							getColumnWidth: getColumnWidthHelper(),
							mainGridRef,
							columnGridRef,
							scrollLeft: 0,
						})}
					</>
				)
			}

			return (
				<ScrollSync>
					{({ onScroll, scrollLeft }) => (
						<>
							{children({
								width: getTotalColumnWidth() + scrollbarSize,
								height: containerHeight,
								getColumnWidth: getColumnWidthHelper(),
								scrollLeft,
								onScroll,
								columnGridRef,
								mainGridRef,
							})}
						</>
					)}
				</ScrollSync>
			)
		}

		//In case of specified width and height, allow the control to the developer
		if (height && width) {
			return (
				<div
					id="grid-container"
					ref={gridContainerRef}
					className={clsx(classes.root, containerClassName)}
					style={{ width, height, position: 'relative' }}
				>
					{render(width, height)}
				</div>
			)
		}

		return (
			<div
				id="grid-container"
				className={clsx(classes.root, containerClassName)}
				ref={gridContainerRef}
			>
				<AutoSizer
					disableWidth={width !== undefined}
					disableHeight={height !== undefined}
					defaultHeight={height}
					defaultWidth={width}
				>
					{({ width, height }) => render(width, height)}
				</AutoSizer>
			</div>
		)
	},
)
