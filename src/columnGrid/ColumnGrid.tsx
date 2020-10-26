import React, { useRef, useEffect, useMemo, useCallback } from 'react'
import { Grid, CellMeasurerCache } from 'react-virtualized'
import CellMeasurer from '../cellMeasurer/CellMeasureWrapper'
import { GridHeader } from './types'
import clsx from 'clsx'
import { ColumnGridProps } from './column-grid-props'
import { MeasurerRendererProps } from '../cellMeasurer'
import Tooltip from '@material-ui/core/Tooltip'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import { ROW_SELECTION_HEADER_ID } from '../rowSelection'
import { makeStyles } from '@material-ui/core/styles'
import { isFunctionType } from '../helpers'
import flattenDeep from 'lodash/flattenDeep'

type SortDisabled = boolean
const useStyles = makeStyles(() => ({
	defaultHeader: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
		width: '100%',
		boxSizing: 'border-box',
		background: '#efefef',
		cursor: 'default',
		border: '1px solid #ccc',
	},
	headerContainer: {
		outline: 'none',
		position: 'sticky !important' as any,
		top: 0,
		zIndex: 1,
		// overflow: 'hidden',
		'scrollbar-width': 'none',
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	},
	contentSpan: {
		textAlign: 'center',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		height: '100%',
	},
	sort: {},
	disableScroll: {
		overflow: 'hidden',
	},
}))
export const ColumnGrid = React.memo((props: ColumnGridProps) => {
	const classes = useStyles()
	const cache = useRef(
		new CellMeasurerCache({
			defaultWidth: props.defaultColumnWidth,
			defaultHeight: props.minRowHeight,
			//Width and height are fixed
			//Width is calculated on useHeaders hook
			//Height is never going to expand to avoid conflicts
			fixedWidth: true,
			fixedHeight: true,
			minHeight: props.minRowHeight,
			minWidth: props.defaultColumnWidth,
		}),
	).current
	const recomputingTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
	const gridRef = useRef<Grid | null>(null)

	//Stores the headers sort configuration (whether they have sort disabled or not)
	const headersSortDisabledMap = useMemo(() => {
		const flattenData = flattenDeep(props.data)
		return flattenData.reduce((mapping, cell) => {
			const updatedMap = { ...mapping }
			if (typeof props.disableSort === 'boolean' && props.disableSort) {
				updatedMap[cell.id] = true
			} else if (cell.isNested || cell.id === ROW_SELECTION_HEADER_ID || cell.dummy) {
				updatedMap[cell.id] = true
			} else if (isFunctionType(props.disableSort)) {
				updatedMap[cell.id] = props.disableSort(cell)
			} else {
				updatedMap[cell.id] = false
			}
			return updatedMap
		}, {} as { [colId: string]: SortDisabled })
	}, [props])

	// clear cache and recompute when data changes OR when the container width changes
	const recomputeSizes = useCallback(() => {
		cache.clearAll()
		gridRef.current?.recomputeGridSize()
	}, [cache])

	function recomputingCleanup() {
		if (recomputingTimeout.current) {
			clearTimeout(recomputingTimeout.current)
		}
	}

	// clear cache and recompute when data changes
	useEffect(() => {
		if (recomputingTimeout.current) {
			clearTimeout(recomputingTimeout.current)
		}
		recomputingTimeout.current = setTimeout(recomputeSizes, 100)
		return recomputingCleanup
	}, [props.data, props.width, recomputeSizes])

	function getSortIndicatorComponent(order: string | undefined) {
		if (!order) {
			return null
		}

		return order === 'asc' ? (
			<ArrowUpwardIcon style={{ fontSize: '10px' }} display={'flex'} />
		) : (
			<ArrowDownwardIcon style={{ fontSize: '10px' }} display={'flex'} />
		)
	}

	const headerRendererWrapper = useCallback(
		({ style, cell, ref, columnIndex, rowIndex }) => {
			const { title, renderer } = cell as GridHeader
			const { theme } = props.apiRef.current
			//in case its not found, we set to true
			const isSortDisabled = headersSortDisabledMap[cell.id] ?? true
			const sort = props.apiRef.current.getSortState()
			const { coords } = props
			const sortComponent =
				isSortDisabled || cell.accessor !== sort?.accessor ? null : (
					<div className={classes.sort}>{getSortIndicatorComponent(sort?.order)}</div>
				)

			let headerClassName = ''
			if (!cell.dummy && cell.isNested) {
				headerClassName = clsx(classes.defaultHeader, theme?.headerClass, theme?.nestedHeaderClass, cell.className)
			}

			if (!cell.dummy && !cell.isNested) {
				headerClassName = clsx(classes.defaultHeader, theme?.headerClass, cell.className)
			}

			//If the cell is selected we set the column as selected too
			if (!cell.dummy && coords.colIndex === columnIndex && !cell.isNested && rowIndex === 0) {
				headerClassName = clsx(headerClassName, theme?.currentColumnClass)
			}

			let children: JSX.Element | React.ReactNode = title
			if (renderer) {
				children = renderer(cell)
			} else if (cell.tooltip) {
				children = (
					<Tooltip title={cell.tooltip} placement={'top'} {...cell.tooltipProps}>
						<span className={headerClassName}>{title}</span>
					</Tooltip>
				)
			}

			const isSpannerAndNested = cell.colSpan && cell.isNested && !cell.dummy
			const defaultZIndex = cell.dummy ? 0 : 1
			return (
				<div
					ref={ref}
					role={'columnheader'}
					className={headerClassName}
					aria-colindex={columnIndex}
					data-rowindex={rowIndex}
					data-dummy={cell.dummy}
					style={{
						...style,
						zIndex: isSpannerAndNested ? 999 : defaultZIndex,
					}}
				>
					{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
					<span onClick={isSortDisabled ? undefined : () => props.apiRef.current.toggleSort(cell.id)} className={classes.contentSpan}>
						{children}
						{sortComponent}
					</span>
				</div>
			)
		},
		[classes.contentSpan, classes.defaultHeader, classes.sort, headersSortDisabledMap, props],
	)

	const cellMeasurerWrapperRenderer = useCallback(
		args => {
			const cell = props.data[args.rowIndex]?.[args.columnIndex] as any
			if (!cell) {
				return null
			}

			const style = {
				...args.style,
				//TODO Review this style property
				...cell.style,
				width: props.getColumnWidth({ index: args.columnIndex }),
				userSelect: 'none',
			}

			const rendererProps: MeasurerRendererProps = {
				...args,
				cell,
				getColumnWidth: props.getColumnWidth,
			}

			return (
				<CellMeasurer
					cache={cache}
					columnIndex={args.columnIndex}
					key={args.key}
					parent={args.parent}
					rowIndex={args.rowIndex}
					//Disable rowSpanning in headers
					rowSpan={0}
					colSpan={cell.colSpan ?? 0}
					cellRenderer={headerRendererWrapper}
					rendererProps={rendererProps}
					style={style}
				/>
			)
		},
		[props, cache, headerRendererWrapper],
	)

	const rowCount = useMemo(() => {
		return props.nestedHeaders ? props.nestedHeaders.length + 1 : 1
	}, [props.nestedHeaders])

	const onRefMount = useCallback(instance => {
		gridRef.current = instance
	}, [])

	return (
		<Grid
			{...props}
			className={clsx(classes.headerContainer, classes.disableScroll)}
			// className={classes.headerContainer}
			ref={onRefMount}
			cellRenderer={cellMeasurerWrapperRenderer}
			deferredMeasurementCache={cache}
			rowHeight={cache.rowHeight}
			rowCount={rowCount}
			columnCount={props.columns.length}
			overscanRowCount={props.overscanRowCount ?? 2}
			overscanColumnCount={props.overscanColumnCount ?? 2}
			width={props.width}
			columnWidth={props.getColumnWidth}
			height={100} //Its going to be ignored due to autoHeight
			autoHeight
			scrollLeft={props.scrollLeft}
		/>
	)
})

export default ColumnGrid
