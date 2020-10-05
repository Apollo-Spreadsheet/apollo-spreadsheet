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
import { Column } from './types/header.type'
import clsx from 'clsx'
import { ColumnGridProps } from './column-grid-props'
import { insertDummyCells } from '../core/utils/insertDummyCells'
import { MeasurerRendererProps } from '../cellMeasurer/cellMeasureWrapperProps'
import Tooltip from '@material-ui/core/Tooltip'

export const ColumnGrid = React.memo(
	forwardRef((props: ColumnGridProps, componentRef) => {
		const cache = useRef(
			new CellMeasurerCache({
				defaultWidth: props.defaultColumnWidth,
				defaultHeight: props.minRowHeight,
				fixedWidth: true,
				minHeight: props.minRowHeight,
				//We might use another approach in here
				minWidth: props.defaultColumnWidth,
			}),
		).current

		useImperativeHandle(componentRef, () => ({
			recomputeGridSize: () => {
				gridRef.current?.recomputeGridSize()
			},
			forceUpdate: () => {
				gridRef.current?.forceUpdate()
			},
		}))
		const gridRef = useRef<Grid | null>(null)

		/** @todo Review insertDummyCells parsing relative to flatMap but also the single array parse is not working well **/
		const data = useMemo(() => {
			return insertDummyCells(props.headers)
		}, [props.headers])

		// clear cache and recompute when data changes
		useEffect(() => {
			cache?.clearAll()
			gridRef.current?.recomputeGridSize()
		}, [data])

		const headerRendererWrapper = useCallback(
			({ style, cell, ref, columnIndex, rowIndex }) => {
				const { title, renderer } = cell as Column
				/** @todo Cache cell renderer result because if may have not changed so no need to invoke again **/
				const children = renderer ? (
					(renderer(cell) as any)
				) : cell.tooltip ? (
					<Tooltip title={title} arrow placement={'top'} {...cell.tooltipProps}>
						<span>{title}</span>
					</Tooltip>
				) : (
					title
				)

				//Ensure dummy cells doesn't have any styling
				const headerClassName =
					!cell.dummy && props.coords.colIndex === columnIndex && rowIndex === 0
						? clsx(props.theme?.headerClass, props.theme?.currentColumnClass)
						: !cell.dummy
						? props.theme?.headerClass
						: undefined

				/**
				 * @todo If it is a nested header we need to load the styling from the theme property and combine using clsx
				 */
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
						}}
					>
						{children}
					</div>
				)
			},
			[props.coords, props.theme, props.width],
		)

		const cellMeasurerWrapperRenderer = useCallback(
			args => {
				const cell = data[args.rowIndex]?.[args.columnIndex]
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
						rowSpan={cell.rowSpan}
						colSpan={cell.colSpan}
						cellRenderer={headerRendererWrapper}
						rendererProps={rendererProps}
						style={style}
					/>
				)
			},
			[data, props.theme, props.coords, props.width],
		)

		const columnCount = useMemo(() => {
			return data.length ? data[0].length : 0
		}, [data])

		const onRefMount = useCallback(instance => {
			gridRef.current = instance
		}, [])

		return (
			<Grid
				{...props}
				ref={onRefMount}
				cellRenderer={cellMeasurerWrapperRenderer}
				deferredMeasurementCache={cache}
				rowHeight={cache.rowHeight}
				rowCount={data.length}
				columnCount={columnCount}
				overscanRowCount={2}
				overscanColumnCount={2}
				width={props.width}
				columnWidth={props.getColumnWidth}
				autoHeight
			/>
		)
	}),
)

export default ColumnGrid
