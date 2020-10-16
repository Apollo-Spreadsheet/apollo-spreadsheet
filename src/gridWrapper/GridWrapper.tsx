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
import { GridApi } from '../types/grid-api.type'
import { NavigationCoords } from '../navigation/types/navigation-coords.type'
import clsx from 'clsx'
import { GridCellProps } from 'react-virtualized/dist/es/Grid'
import { MeasurerRendererProps } from '../cellMeasurer/cellMeasureWrapperProps'
import { CellEventParams, GridWrapperProps } from './gridWrapperProps'
import { makeStyles } from '@material-ui/core/styles'
import { StretchMode } from '../types/stretch-mode.enum'
import { createMergedPositions, MergePosition } from '../mergeCells/createMergedPositions'
import { MergeCell } from "../mergeCells/interfaces/merge-cell";

const useStyles = makeStyles(() => ({
	bodyContainer: {
		outline: 'none',
	},
	cellDefaultStyle: {
		'&:focus': {
			outline: 0,
			border: 0,
		},
	},
	suppressHorizontalOverflow: {
		overflowX: 'hidden',
	},
}))

const GridWrapper = forwardRef((props: GridWrapperProps, componentRef: React.Ref<GridApi>) => {
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
			return props.headers[index]
		},
		[props.headers],
	)

	const gridApi = () => {
		return {
			recomputeGridSize: () => {
				gridRef.current?.recomputeGridSize()
			},
			forceUpdate: () => {
				gridRef.current?.forceUpdate()
			},
			getRowsCount: () => props.data.length,
			getRowAt: getColumnAt,
			getCellAt: ({ rowIndex, colIndex }: NavigationCoords) => {
				return props.data[rowIndex]?.[colIndex]
			},
			getColumnAt,
			selectedCell: (_cellCoords: NavigationCoords) => props.selectCell(_cellCoords),
		} as GridApi
	}

	useImperativeHandle(
		componentRef,
		() => {
			return gridApi()
		},
		[props.data, getColumnAt, gridRef.current],
	)

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
	}, [props.data, props.width, props.height])

	const onCellDoubleClick = ({
		event,
		cell,
		columnIndex,
		rowIndex,
	}: CellEventParams<React.MouseEvent<HTMLDivElement>>) => {
		event.preventDefault()
		if (cell.dummy) {
			return
		}
		props.restoreGridFocus()
		props.beginEditing({
			coords: { rowIndex, colIndex: columnIndex },
			targetElement: event.target as HTMLElement,
		})
	}

	const onCellClick = ({
		cell,
		rowIndex,
		columnIndex,
	}: CellEventParams<React.MouseEvent<HTMLDivElement>>) => {
		if (cell?.dummy) {
			return
		}

		props.restoreGridFocus()
		props.selectCell({
			rowIndex,
			colIndex: columnIndex,
		})
	}

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
			//In case the given row is merged, build the path
			if (mergedPosition) {
				const rowMergeGroups: { [rowIndex: number]: number[] } = []
				for (const e of props.mergeCells) {
					const childs: number[] = []
					const ranges = {
						rowStart: e.rowIndex + 1,
						rowEnd: e.rowIndex + Math.max(0, e.rowSpan - 1),
						colStart: e.colIndex,
						colEnd: e.colIndex + Math.max(0, e.colSpan - 1),
					}

					for (let i = ranges.rowStart; i <= ranges.rowEnd; i++) {
						childs.push(i)
					}
					rowMergeGroups[e.rowIndex] = childs
				}

				//First position is the parent OR the active if its the parent and the second is the child aka current
				const activeRowPath: number[] = []

				//Check if the target row exists in any group
				for (const [parentRow, childs] of Object.entries(rowMergeGroups)) {
					const isIncluded = childs.includes(props.coords.rowIndex)
					if (isIncluded) {
						activeRowPath.push(Number(parentRow))
						activeRowPath.push(props.coords.rowIndex)
						break
					}
				}
				return activeRowPath
			} else {
				return [props.coords.rowIndex]
			}
		}
	}, [props.coords, props.mergeCells, props.mergedPositions])


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
			if (rowIndex === activeMergePath[0]){
				const mergeInfo = Object.values(props.mergeCells ?? [] as MergeCell[])
				const columnWithMerge = mergeInfo.reduce((acc, e) => {
						if (!acc.some(index => index === e.colIndex)){
							acc.push(e.colIndex)
						}
						return acc
				}, [] as number[])
				return columnWithMerge.includes(colIndex)
			}

			//Second index means the current row with the highlight
			if (rowIndex === activeMergePath[1]){
				return true
			}
		}

		return false
	}

	function renderCell({ style, cell, ref, rowIndex, columnIndex }) {
		const isSelected = rowIndex === props.coords.rowIndex && columnIndex === props.coords.colIndex
		const navigationDisabled = props.headers[0][columnIndex]?.disableNavigation
		//Dummy zIndex is 0 and a spanned cell has 5 but a normal cell has 1
		const zIndex = (cell.rowSpan || cell.colSpan) && !cell.dummy ? 5 : cell.dummy ? 0 : 1

		const isRowSelected = isActiveRow({ rowIndex, colIndex: columnIndex })

		if (isSelected) {
			style.border = '1px solid blue'
		} else {
			//Bind default border
			if (!props.theme || (!props.theme.cellClass && !cell.dummy)) {
				style.border = '1px solid rgb(204, 204, 204)'
			}
		}

		/**
		 * @todo We need to check if the row is a dummy but its parent dummy is not anymore visible (we need to pass the content to the last visible child)
		 * e.:g
		 * dummy 1 has a rowspan of total 3 but none of its parent are visible, so dummy 3 assume the children value and highlight
		 * of the parent because there is none visible
		 * */
		let cellClassName = clsx(classes.cellDefaultStyle, props.theme?.cellClass)
		if (isRowSelected && !cell.dummy && props.theme?.currentRowClass) {
			cellClassName = clsx(cellClassName, props.theme?.currentRowClass)
		}

		if (navigationDisabled && !cell.dummy && props.theme?.disabledCellClass) {
			style.cursor = 'default' //no clickable action for this cell
			style.pointerEvents = 'none' //no events for this cell
			cellClassName = clsx(cellClassName, props.theme?.disabledCellClass)
		}

		return (
			<div
				id={`cell-${rowIndex}-${columnIndex}`}
				className={cellClassName}
				style={{
					...style,
					display: 'flex',
					justifyContent: cell?.dummy ? 'top' : 'center',
					boxSizing: 'border-box',
					zIndex,
				}}
				// tabIndex={1}
				onClick={event =>
					onCellClick({
						event,
						cell,
						rowIndex,
						columnIndex,
					})
				}
				onDoubleClick={event =>
					onCellDoubleClick({
						event,
						cell,
						rowIndex,
						columnIndex,
					})
				}
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
		[props.coords, props.theme, props.width, props.data, props.selectCell, activeMergePath],
	)

	const onRefMount = useCallback(
		instance => {
			//Pass down for react-virtualized under-layer
			if (instance) {
				props.registerChild?.(instance)
			}

			//Expose if needed
			if (props.onGridReady && (componentRef as any).current) {
				props.onGridReady((componentRef as any).current as GridApi)
			}
			gridRef.current = instance
		},
		[props.onGridReady, props.registerChild, (componentRef as any).current],
	)

	const onSectionRendered = useCallback(
		(params: SectionRenderedParams) => {
			/** @todo Store in a ref the visible rows/columns **/
			// Check if the editing coords are within the visible range
			if (props.editorState) {
				if (
					props.editorState.rowIndex < params.rowStartIndex ||
					props.editorState.rowIndex > params.rowStopIndex
				) {
					props.stopEditing({ save: false })
				} else if (
					props.editorState.colIndex < params.columnStartIndex ||
					props.editorState.colIndex > params.columnStopIndex
				) {
					props.stopEditing({ save: false })
				}
			}
		},
		[props.editorState],
	)

	return (
		<Grid
			{...props}
			// className={props.stretchMode !== StretchMode.None ? clsx(classes.bodyContainer, classes.suppressHorizontalOverflow) : classes.bodyContainer}
			className={classes.bodyContainer}
			ref={onRefMount}
			cellRenderer={cellRenderer}
			deferredMeasurementCache={cache}
			rowHeight={cache.rowHeight}
			rowCount={props.rows.length}
			columnCount={props.columnCount}
			overscanRowCount={props.overscanRowCount ?? 2}
			overscanColumnCount={props.overscanColumnCount ?? 2}
			columnWidth={props.getColumnWidth}
			onSectionRendered={onSectionRendered}
			scrollToRow={props.coords.rowIndex}
			scrollToColumn={props.coords.colIndex}
			scrollToAlignment={props.scrollToAlignment}
			onScroll={props.onScroll}
			scrollLeft={props.scrollLeft}
			// onScroll={params => {
			// 	console.warn(params)
			// }}
		/>
	)
})

export default GridWrapper
