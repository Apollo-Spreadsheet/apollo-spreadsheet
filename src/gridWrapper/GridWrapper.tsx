import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react'
import { CellMeasurerCache, Grid, SectionRenderedParams } from 'react-virtualized'
import CellMeasurer from '../cellMeasurer/CellMeasureWrapper'
import { NavigationCoords } from '../navigation/types/navigation-coords.type'
import clsx from 'clsx'
import { GridCellProps } from 'react-virtualized/dist/es/Grid'
import { MeasurerRendererProps } from '../cellMeasurer/cellMeasureWrapperProps'
import { GridWrapperProps } from './gridWrapperProps'
import { makeStyles } from '@material-ui/core/styles'
import { MergeCell } from '../mergeCells/interfaces/merge-cell'
import { StretchMode } from '../types'
import { useLogger } from "../logger"

const useStyles = makeStyles(() => ({
	bodyContainer: {
		outline: 'none',
	},
	cellDefaultStyle: {
		display: 'flex',
		boxSizing: 'border-box',
		'&:focus': {
			outline: 0,
			border: 0,
		},
	},
	disabledCell: {
		cursor: 'default', //no clickable action for this cell
		pointerEvents: 'none', //no events for this cell
	},
	suppressHorizontalOverflow: {
		overflowX: 'hidden',
	},
}))

const GridWrapper = forwardRef((props: GridWrapperProps, componentRef: React.Ref<any>) => {
	const logger = useLogger('GridWrapper')
	const cache = useRef(
		new CellMeasurerCache({
			defaultWidth: props.defaultColumnWidth,
			defaultHeight: props.minRowHeight,
			fixedWidth: true,
			minHeight: props.minRowHeight,
			minWidth: props.defaultColumnWidth,
		}),
	).current

	const classes = useStyles()
	const gridRef = useRef<Grid | null>(null)
	const recomputingTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

	/**
	 * Returns a given column at the provided index if exists
	 * @param index
	 * @param line  This represents the row but by default we fetch only from the first, this is in order to support nested headers
	 */
	const getColumnAt = useCallback(
		(index: number) => {
			return props.columns[index]
		},
		[props.columns],
	)

	useImperativeHandle(
		componentRef,
		() => ({
			recomputeGridSize: () => {
				gridRef.current?.recomputeGridSize()
			},
			forceUpdate: () => {
				gridRef.current?.forceUpdate()
			},
		}),
		[props.data, getColumnAt, gridRef.current],
	)

	function recomputeSizes() {
		logger.debug('Recomputing sizes.')
		cache.clearAll()
		gridRef.current?.recomputeGridSize()
		//When the re-computation happens the scroll position is affected and gets reset
		gridRef.current?.scrollToCell({
			columnIndex: props.coords.colIndex,
			rowIndex: props.coords.rowIndex,
		})
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
	}, [props.data, props.width, props.height])

	const activeMergePath = useMemo(() => {
		//If there is no merging then we use the active directly
		if (
			!props.mergeCells ||
			props.mergeCells.length === 0 ||
			!props.mergedPositions ||
			props.mergedPositions.length === 0
		) {
			return [props.coords.rowIndex]
		}

		//Find if the rowIndex and col are a parent merger otherwise they are merged
		//If its a parent we can create the path easily
		//Otherwise we need go from the child up to the parent
		const mergeInfo = props.mergeCells.find(e => e.rowIndex === props.coords.rowIndex)
		if (mergeInfo) {
			return [mergeInfo.rowIndex]
		} else {
			const mergedPosition = props.mergedPositions.find(e => e.row === props.coords.rowIndex)
			//In case the given row is merged, build the path with all existing merge cells
			if (mergedPosition) {
				return props.apiRef.current.getMergedPath(props.coords.rowIndex)
			} else {
				return [props.coords.rowIndex]
			}
		}
	}, [props.coords, props.mergeCells, props.mergedPositions, props.apiRef])

	/**
	 * Checks if the given coordinates can use the currentClassName
	 * @param rowIndex
	 * @param colIndex
	 */
	function isActiveRow({ rowIndex, colIndex }: NavigationCoords) {
		if (activeMergePath[0] === rowIndex && activeMergePath.length === 1) {
			return true
		}

		//We have the parent and the merged
		if (activeMergePath.length > 1) {
			if (rowIndex === activeMergePath[0]) {
				const mergeInfo = Object.values(props.mergeCells ?? ([] as MergeCell[]))
				const columnWithMerge = mergeInfo.reduce((acc, e) => {
					if (!acc.some(index => index === e.colIndex)) {
						acc.push(e.colIndex)
					}
					return acc
				}, [] as number[])
				return columnWithMerge.includes(colIndex)
			}

			//Second index means the current row with the highlight
			if (rowIndex === activeMergePath[1]) {
				return true
			}
		}

		return false
	}

	function renderCell({ style, cell, ref, rowIndex, columnIndex }) {
		const isSelected = rowIndex === props.coords.rowIndex && columnIndex === props.coords.colIndex
		const navigationDisabled = props.columns[0][columnIndex]?.disableNavigation
		const column = props.columns[columnIndex]
		//Dummy zIndex is 0 and a spanned cell has 5 but a normal cell has 1
		const zIndex = (cell.rowSpan || cell.colSpan) && !cell.dummy ? 5 : cell.dummy ? 0 : 1
		const isRowActive = isActiveRow({ rowIndex, colIndex: columnIndex })
		const theme = props.apiRef.current.theme

		if (isSelected) {
			//Ensure there are no other borders
			style.borderLeft = '0px'
			style.borderRight = '0px'
			style.borderTop = '0px'
			style.borderBottom = '0px'
			style.border = props.highlightBorderColor
				? `1px solid ${props.highlightBorderColor}`
				: '1px solid blue'
		} else {
			//Bind default border and clear other borders
			if (!theme || (!theme.cellClass && !cell.dummy)) {
				style.borderLeft = '0px'
				style.borderRight = '0px'
				style.borderTop = '0px'
				style.borderBottom = '0px'
				style.border = '1px solid rgb(204, 204, 204)'
			}
		}

		/**
		 * @todo We need to check if the row is a dummy but its parent dummy is not anymore visible (we need to pass the content to the last visible child)
		 * e.:g
		 * dummy 1 has a rowspan of total 3 but none of its parent are visible, so dummy 3 assume the children value and highlight
		 * of the parent because there is none visible
		 * */
		let cellClassName = clsx(classes.cellDefaultStyle, theme?.cellClass, column.cellClassName)
		if (isRowActive && !cell.dummy && theme?.currentRowClass) {
			cellClassName = clsx(cellClassName, theme?.currentRowClass)
		}

		if (navigationDisabled && !cell.dummy && theme?.disabledCellClass) {
			cellClassName = clsx(cellClassName, classes.disabledCell, theme?.disabledCellClass)
		}

		if (props.selection && props.selection.cellClassName) {
			const row = props.apiRef.current.getRowAt(rowIndex)
			const isRowSelected = props.apiRef.current.isRowSelected(row?.[props.selection.key])
			if (isRowSelected) {
				cellClassName = clsx(cellClassName, props.selection.cellClassName)
			}
		}

		return (
			<div
				role={'cell'}
				aria-colindex={columnIndex}
				data-rowindex={rowIndex}
				data-accessor={column.accessor}
				data-dummy={cell.dummy}
				className={cellClassName}
				style={{
					...style,
					justifyContent: cell?.dummy ? 'top' : 'center',
					zIndex,
				}}
				ref={ref}
			>
				{cell.value}
			</div>
		)
	}

	const cellRenderer = useCallback(
		({ rowIndex, columnIndex, key, parent, style, ...otherArgs }: GridCellProps) => {
			const cell = props.data[rowIndex]?.[columnIndex]

			const rendererProps: MeasurerRendererProps = {
				...otherArgs,
				style,
				rowIndex,
				columnIndex,
				cell,
				getColumnWidth: props.getColumnWidth,
			}

			return cell ? (
				<CellMeasurer
					cache={cache}
					columnIndex={columnIndex}
					key={key}
					parent={parent}
					rowIndex={rowIndex}
					rowSpan={cell.rowSpan}
					colSpan={cell.colSpan}
					cellRenderer={renderCell}
					style={{
						...style,
						...cell.style,
						width: props.getColumnWidth({
							index: columnIndex,
						}),
						userSelect: 'none',
					}}
					rendererProps={rendererProps}
				/>
			) : null
		},
		[
			props.coords,
			props.width,
			props.data,
			props.apiRef,
			activeMergePath,
			props.columns,
			props.selection,
		],
	)

	const onRefMount = useCallback(
		instance => {
			gridRef.current = instance
		},
		[],
	)

	const onSectionRendered = useCallback(
		(params: SectionRenderedParams) => {
			const editorState = props.apiRef.current.getEditorState()
			/** @todo Store in a ref the visible rows/columns **/
			// Check if the editing coords are within the visible range
			if (editorState) {
				if (
					editorState.rowIndex < params.rowStartIndex ||
					editorState.rowIndex > params.rowStopIndex
				) {
					props.apiRef.current.stopEditing({ save: false })
				} else if (
					editorState.colIndex < params.columnStartIndex ||
					editorState.colIndex > params.columnStopIndex
				) {
					props.apiRef.current.stopEditing({ save: false })
				}
			}
		},
		[props.apiRef],
	)

	return (
		<Grid
			{...props}
			className={
				props.stretchMode !== StretchMode.None
					? clsx(classes.bodyContainer, classes.suppressHorizontalOverflow)
					: classes.bodyContainer
			}
			// className={classes.bodyContainer}
			ref={onRefMount}
			cellRenderer={cellRenderer}
			deferredMeasurementCache={cache}
			rowHeight={cache.rowHeight}
			rowCount={props.rows.length}
			columnCount={props.columnCount}
			columnWidth={props.getColumnWidth}
			overscanRowCount={props.overscanRowCount ?? 2}
			overscanColumnCount={props.overscanColumnCount ?? 2}
			onSectionRendered={onSectionRendered}
			scrollToRow={props.coords.rowIndex}
			scrollToColumn={props.coords.colIndex}
			scrollToAlignment={props.scrollToAlignment}
			onScroll={props.onScroll}
			scrollLeft={props.scrollLeft}
		/>
	)
})

export default GridWrapper
