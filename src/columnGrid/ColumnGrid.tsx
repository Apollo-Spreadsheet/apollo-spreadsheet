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
import { Header } from './types/header.type'
import clsx from 'clsx'
import { ColumnGridProps } from './column-grid-props'
import { MeasurerRendererProps } from '../cellMeasurer/cellMeasureWrapperProps'
import Tooltip from '@material-ui/core/Tooltip'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import { ROW_SELECTION_HEADER_ID } from '../rowSelection/useRowSelection'
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
	headerContainer: {
		outline: 'none',
		position: 'sticky !important' as any,
		top: 0,
		zIndex: 1,
		'scrollbar-width': 'none',
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	}
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

		useImperativeHandle(componentRef, () => ({
			recomputeGridSize: () => {
				gridRef.current?.recomputeGridSize()
			},
			forceUpdate: () => {
				gridRef.current?.forceUpdate()
			},
		}))
		const gridRef = useRef<Grid | null>(null)

		// clear cache and recompute when data changes OR when the container width changes
		function recomputeSizes(){
			cache.clearAll()
			gridRef.current?.recomputeGridSize()
		}

		function recomputingCleanup() {
			if (recomputingTimeout.current){
				clearTimeout(recomputingTimeout.current)
			}
		}

		// clear cache and recompute when data changes
		useEffect(() => {
			if (recomputingTimeout.current){
				clearTimeout(recomputingTimeout.current)
			}
			recomputingTimeout.current = setTimeout(recomputeSizes, 200)
			return recomputingCleanup
		}, [props.data, props.width])

		function getSortIndicatorComponent(order: string | undefined) {
			if (!order) {
				return null
			}

			return order === 'asc' ? (
				<ArrowUpwardIcon style={{ fontSize: '10px' }} display={'flex'} />
			) : (
				<ArrowDownwardIcon style={{ fontSize: '10px'}} display={'flex'}/>
			)
		}

		const headerRendererWrapper = useCallback(
			({ style, cell, ref, columnIndex, rowIndex }) => {
				const { title, renderer } = cell as Header
				/** @todo Cache cell renderer result because if may have not changed so no need to invoke again **/
				const children = renderer ? (
					(renderer(cell) as any)
				) : cell.tooltip ? (
					<Tooltip title={title} placement={'top'} {...cell.tooltipProps}>
						<span>{title}</span>
					</Tooltip>
				) : (
					title
				)

				let headerClassName = !cell.dummy
					? cell.isNested
						? clsx(props.theme?.headerClass, props.theme?.nestedHeaderClass, cell.className)
						: clsx(props.theme?.headerClass, cell.className)
					: undefined
				//If the cell is selected we set the column as selected too
				if (
					!cell.dummy &&
					props.coords.colIndex === columnIndex &&
					!cell['isNested'] &&
					rowIndex === 0
				) {
					headerClassName = clsx(headerClassName, props.theme?.currentColumnClass)
				}


				return (
					<div
						ref={ref}
						className={headerClassName}
						style={{
							display: 'flex',
							justifyContent: 'center',
							padding: '5px',
							boxSizing: 'border-box',
							background: '#efefef',
							border: '1px solid #ccc',
							cursor: 'default',
							...style,
							zIndex: cell.colSpan && cell['isNested'] && !cell.dummy ? 999 : cell.dummy ? 0 : 1,
						}}
					>
						{/** @todo If grid sort is not enabled, we just render the {children} **/}
						<span
							onClick={() =>
								cell.dummy || cell.id === ROW_SELECTION_HEADER_ID
									? undefined
									: props.onSortClick(cell.accessor)
							}
						style={{
							textAlign: 'center',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
					}}
						>
							{children}
							{/** @todo Its temporary, create a better sort component if sort is enabled on plugin and also sort goes to the n **/}
							<div style={{ marginLeft: '10px' }}>
								{cell.accessor === props.sort?.field
									? getSortIndicatorComponent(props.sort?.order)
									: null}
							</div>
						</span>
					</div>
				)
			},
			[props.coords, props.theme, props.width, props.sort],
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
					...cell['style'],
					width: props.getColumnWidth({ index: args.columnIndex }),
					userSelect: 'none',
				}


				const rendererProps: MeasurerRendererProps = {
					...args,
					cell,
					getColumnWidth: props.getColumnWidth,
				}

				if (isNaN(Number(style.width))){
					console.error("WIDTH NAN AT CELL MEASURER WRAPPER STYLE")
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
			[props.data, props.theme, props.coords, props.width, props.sort],
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
			/>
		)
	}),
)

export default ColumnGrid
