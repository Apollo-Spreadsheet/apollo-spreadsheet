import React, { useCallback, useRef, useState } from 'react'
import { StretchMode } from '../types/stretch-mode.enum'
import { scrollbarWidth } from '@xobotyi/scrollbar-width'
import { AutoSizer, ColumnSizer, OnScrollParams, ScrollSync } from 'react-virtualized'
import { createFixedWidthMapping } from '../columnGrid/utils/createFixedWidthMapping'
import { FixedColumnWidthRecord } from '../columnGrid/useHeaders'
import { Header } from '../columnGrid/types/header.type'
import { RegisterChildFn } from '../gridWrapper/interfaces/registerChildFn'
import { makeStyles } from '@material-ui/core/styles'
import shallowDiffers from '../helpers/shallowDiffers'
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
	registerChild?: RegisterChildFn
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

		const buildColumnTotalWidth = (containerWidth: number) => {
			//Returned cached result
			if (
				!shallowDiffers(headers, lastHeaders.current) &&
				lastContainerWidth.current === containerWidth
			) {
				return remainingWidth.current
			}

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
										width: containerWidth,
										// width:
										// 	normalizedAdjustedWidth + fixedColumnWidths.current.totalSize + scrollbarSize,
										height: containerHeight,
										getColumnWidth: getColumnWidthHelper(getColumnWidth),
										mainGridRef,
										columnGridRef,
										registerChild,
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
											width: containerWidth,
											// width:
											// 	normalizedAdjustedWidth +
											// 	fixedColumnWidths.current.totalSize +
											// 	scrollbarSize,
											height: containerHeight,
											getColumnWidth: getColumnWidthHelper(getColumnWidth),
											scrollLeft,
											onScroll,
											registerChild,
											columnGridRef,
											mainGridRef,
										})}
									</>
								)}
							</ScrollSync>
						)
					}}
				</ColumnSizer>
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
				<AutoSizer disableWidth={width !== undefined} disableHeight={height !== undefined} defaultHeight={height} defaultWidth={width}>
					{({ width, height }) => render(width, height)}
				</AutoSizer>
			</div>
		)
	},
)
