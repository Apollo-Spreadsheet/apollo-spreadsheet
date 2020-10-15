import React, { useCallback, useRef, useState } from 'react'
import { StretchMode } from '../types/stretch-mode.enum'
import { scrollbarWidth } from '@xobotyi/scrollbar-width'
import { AutoSizer, ColumnSizer } from 'react-virtualized'
import HorizontalScroll from '../horizontalScroll/HorizontalScroll'
import { createFixedWidthMapping } from '../columnGrid/utils/createFixedWidthMapping'
import { FixedColumnWidthRecord } from '../columnGrid/useHeaders'
import { ScrollHandlerRef } from '../horizontalScroll/horizontalScrollProps'
import { Header } from '../columnGrid/types/header.type'
import { RegisterChildFn } from '../gridWrapper/interfaces/registerChildFn'
import { makeStyles } from '@material-ui/core/styles'
import shallowDiffers from '../helpers/shallowDiffers'
import clsx from "clsx"

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
	registerChild?: RegisterChildFn
	columnGridRef: React.MutableRefObject<any>
	mainGridRef: React.MutableRefObject<any>
}

export interface GridContainerCommonProps {
	height?: number
	width?: number
	containerClassName?: string
}

interface Props extends GridContainerCommonProps {
	headers: Header[]
	minColumnWidth: number
	dynamicColumnCount: number
	stretchMode: StretchMode
	children: (props: GridContainerChildrenProps) => unknown
}

export const GridContainer = React.memo(
	({
		minColumnWidth,
		dynamicColumnCount,
		stretchMode,
		headers,
		children,
		width,
		height,
		 containerClassName
	}: Props) => {
		const scrollbarSize = scrollbarWidth() ?? 0
		const classes = useStyles()
		const gridContainerRef = useRef<HTMLDivElement | null>(null)
		const mainGridRef = useRef<any | null>(null)
		const columnGridRef = useRef<any | null>(null)
		const scrollHandlerRef = useRef<ScrollHandlerRef | null>(null)
		const fixedColumnWidths = useRef<FixedColumnWidthRecord>({
			totalSize: 0,
			mapping: {},
		})
		const lastContainerWidth = useRef(0)
		const remainingWidth = useRef(0)
		const lastHeaders = useRef<Header[]>([])

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
			if (!getColumnWidth) {
				return fixedColumnWidths.current.mapping[index] ?? minColumnWidth
			}
			return fixedColumnWidths.current.mapping[index] ?? getColumnWidth({ index })
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

		const buildColumnTotalWidth = (containerWidth: number) => {
			//Returned cached result
			if (
				!shallowDiffers(headers, lastHeaders.current) &&
				lastContainerWidth.current === containerWidth
			) {
				return remainingWidth.current
			}

			//console.warn('Building..')
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

			const width = Math.min(
				containerWidth,
				Math.max(0, containerWidth) - fixedColumnWidths.current.totalSize,
			)

			//Cache the dependencies
			lastContainerWidth.current = containerWidth
			lastHeaders.current = headers
			remainingWidth.current = width

			return width
		}

		function render(containerWidth: number, containerHeight = 500) {
			const remainingWidth = buildColumnTotalWidth(containerWidth)
			return (
				<ColumnSizer
					columnMinWidth={minColumnWidth}
					columnCount={dynamicColumnCount}
					width={remainingWidth}
				>
					{({ registerChild, getColumnWidth, adjustedWidth }) => {
						const normalizedAdjustedWidth = isNaN(adjustedWidth) ? 0 : adjustedWidth
						if (stretchMode !== StretchMode.None) {
							return (
								<>
									{children({
										width:
											normalizedAdjustedWidth + fixedColumnWidths.current.totalSize + scrollbarSize,
										height: containerHeight,
										getColumnWidth: getColumnWidthHelper(),
										mainGridRef,
										columnGridRef,
										registerChild,
									})}
								</>
							)
						}

						/** @todo Not working yet, requires a major refactor on Horizontal scroll **/
						return (
							<HorizontalScroll
								scrollContainer={gridContainerRef.current}
								width={containerWidth}
								totalColumnWidth={getTotalColumnWidth(getColumnWidth)}
								ref={scrollHandlerRef}
							>
								{({ scrollTop, scrollLeft, isScrolling, gridRef, headerRef, height }) =>
									children({
										width:
											normalizedAdjustedWidth + fixedColumnWidths.current.totalSize + scrollbarSize,
										height: containerHeight,
										getColumnWidth: getColumnWidthHelper(),
										mainGridRef,
										columnGridRef,
										registerChild,
									})
								}
							</HorizontalScroll>
						)
					}}
				</ColumnSizer>
			)
		}

		//In case of specified width and height, allow the control to the developer
		if (height && width){
			return (
				<div id="grid-container" ref={gridContainerRef} className={clsx(classes.root, containerClassName)} style={{ width, height, position: 'relative' }}>
					{render(width, height)}
				</div>
			)
		}

		return (
			<div id="grid-container" className={clsx(classes.root, containerClassName)} ref={gridContainerRef}>
				<AutoSizer
					disableWidth={width !== undefined}
					disableHeight={height !== undefined}
				>
					{({ width, height }) => render(width, height)}
				</AutoSizer>
			</div>
		)
	},
)
