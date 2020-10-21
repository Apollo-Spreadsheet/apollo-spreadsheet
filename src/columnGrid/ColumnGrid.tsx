import React, {
	useRef,
	useEffect,
	useMemo,
	useCallback,
	useImperativeHandle,
	forwardRef,
} from 'react'
import { Grid, CellMeasurerCache } from 'react-virtualized'
import CellMeasurer from '../cellMeasurer/CellMeasureWrapper'
import { GridHeader, Header } from './types/header.type'
import clsx from 'clsx'
import { ColumnGridProps } from './column-grid-props'
import { MeasurerRendererProps } from '../cellMeasurer/cellMeasureWrapperProps'
import Tooltip from '@material-ui/core/Tooltip'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import { ROW_SELECTION_HEADER_ID } from '../rowSelection/useRowSelection'
import { makeStyles } from '@material-ui/core/styles'
import { isFunctionType } from '../helpers/isFunction'
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
		border: '1px solid #ccc'
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
	sort: {
		marginLeft: '10px',
	},
}))
export const ColumnGrid = React.memo(
	forwardRef((props: ColumnGridProps, componentRef) => {
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
			const mapping: { [colId: string]: SortDisabled } = {}
			const flattenData = flattenDeep(props.data)
			for (const cell of flattenData) {
				if (typeof props.disableSort === 'boolean' && props.disableSort) {
					mapping[cell.id] = true
				} else {
					if (cell.isNested || cell.id === ROW_SELECTION_HEADER_ID || cell.dummy) {
						mapping[cell.id] = true
					} else {
						if (isFunctionType(props.disableSort)) {
							mapping[cell.id] = props.disableSort(cell)
						} else {
							mapping[cell.id] = false
						}
					}
				}
			}
			return mapping
		}, [props.data, props.disableSort])

		useImperativeHandle(componentRef, () => ({
			recomputeGridSize: () => {
				gridRef.current?.recomputeGridSize()
			},
			forceUpdate: () => {
				gridRef.current?.forceUpdate()
			},
		}))

		// clear cache and recompute when data changes OR when the container width changes
		function recomputeSizes() {
			cache.clearAll()
			gridRef.current?.recomputeGridSize()
		}

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
		}, [props.data, props.width])

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

		const headerRendererWrapper = ({ style, cell, ref, columnIndex, rowIndex }) => {
			const { title, renderer } = cell as GridHeader
			const theme = props.apiRef.current.theme
			const isSortDisabled = headersSortDisabledMap[cell.id] ?? true //in case its not found, we set to true

			const sortComponent =
				isSortDisabled || cell.accessor !== props.sort?.field ? null : (
					<div className={classes.sort}>{getSortIndicatorComponent(props.sort?.order)}</div>
				)

			let headerClassName = !cell.dummy
				? cell.isNested
					? clsx(classes.defaultHeader, theme?.headerClass, theme?.nestedHeaderClass, cell.className)
					: clsx(classes.defaultHeader, theme?.headerClass, cell.className)
				: undefined

			//If the cell is selected we set the column as selected too
			if (
				!cell.dummy &&
				props.coords.colIndex === columnIndex &&
				!cell['isNested'] &&
				rowIndex === 0
			) {
				headerClassName = clsx(headerClassName, theme?.currentColumnClass)
			}

			/** @todo Cache cell renderer result because if may have not changed so no need to invoke again **/
			const children = renderer ? (
				(renderer(cell) as any)
			) : cell.tooltip ? (
				<Tooltip title={cell.tooltip} placement={'top'} {...cell.tooltipProps}>
					<span className={headerClassName}>{title}</span>
				</Tooltip>
			) : (
				title
			)

			return (
				<div
					ref={ref}
					role={"columnheader"}
					className={ !cell.tooltip ? headerClassName : undefined}
					aria-colindex={columnIndex}
					data-rowindex={rowIndex}
					data-dummy={cell.dummy}
					style={{
						...style,
						zIndex: cell.colSpan && cell['isNested'] && !cell.dummy ? 999 : cell.dummy ? 0 : 1,
					}}
				>
					<span
						onClick={isSortDisabled ? undefined : () => props.onSortClick(cell.accessor)}
						className={classes.contentSpan}
					>
						{children}
						{sortComponent}
					</span>
				</div>
			)
		}

		const cellMeasurerWrapperRenderer = useCallback(
			args => {
				const cell = props.data[args.rowIndex]?.[args.columnIndex] as any
				if (!cell) {
					return null
				}

				const style = {
					...args.style,
					//TODO Review this style property
					...cell['style'],
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
			[
				props.data,
				props.apiRef,
				props.coords,
				props.width,
				headersSortDisabledMap,
				props.disableSort,
				props.sort,
			],
		)

		const rowCount = useMemo(() => {
			return props.nestedHeaders ? props.nestedHeaders.length + 1 : 1
		}, [props.nestedHeaders])

		const columnCount = useMemo(() => {
			return props.headers.length
		}, [props.headers])

		const onRefMount = useCallback(instance => {
			gridRef.current = instance
		}, [])

		return (
			<Grid
				{...props}
				className={classes.headerContainer}
				ref={onRefMount}
				cellRenderer={cellMeasurerWrapperRenderer}
				deferredMeasurementCache={cache}
				rowHeight={cache.rowHeight}
				rowCount={rowCount}
				columnCount={columnCount}
				overscanRowCount={props.overscanRowCount ?? 2}
				overscanColumnCount={props.overscanColumnCount ?? 2}
				width={props.width}
				columnWidth={props.getColumnWidth}
				height={100} //Its going to be ignored due to autoHeight
				autoHeight
				scrollLeft={props.scrollLeft}
			/>
		)
	}),
)

export default ColumnGrid
