import React, { CSSProperties, useCallback, useEffect, useMemo, useRef } from 'react'
import { CellMeasurerCache, Grid, SectionRenderedParams } from 'react-virtualized'
import CellMeasurer from '../cellMeasurer/CellMeasureWrapper'
import { NavigationCoords } from '../navigation/types'
import clsx from 'clsx'
import { GridCellProps } from 'react-virtualized/dist/es/Grid'
import { MeasurerRendererProps } from '../cellMeasurer'
import { GridWrapperProps } from './gridWrapperProps'
import { makeStyles } from '@material-ui/core/styles'
import { MergeCell } from '../mergeCells/interfaces'
import { StretchMode } from '../types'
import { useLogger } from '../logger'

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

const GridWrapper = React.memo((props: GridWrapperProps) => {
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

	const recomputeSizes = useCallback(() => {
		logger.debug('Recomputing sizes.')
		cache.clearAll()
		gridRef.current?.recomputeGridSize()
		//When the re-computation happens the scroll position is affected and gets reset
		gridRef.current?.scrollToCell({
			columnIndex: props.coords.colIndex,
			rowIndex: props.coords.rowIndex,
		})
	}, [logger, cache, props.coords])

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
	}, [props.data, props.width, props.height, recomputeSizes])

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
		}
		const mergedPosition = props.mergedPositions.find(e => e.row === props.coords.rowIndex)
		//In case the given row is merged, build the path with all existing merge cells
		if (mergedPosition) {
			return props.apiRef.current.getMergedPath(props.coords.rowIndex)
		}
		return [props.coords.rowIndex]
	}, [props.coords, props.mergeCells, props.mergedPositions, props.apiRef])

	/**
	 * Checks if the given coordinates can use the currentClassName
	 * @param rowIndex
	 * @param colIndex
	 */
	const isActiveRow = useCallback(
		({ rowIndex, colIndex }: NavigationCoords) => {
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
		},
		[activeMergePath, props.mergeCells],
	)

	const renderCell = useCallback(
		({ style, cell, ref, rowIndex, columnIndex }) => {
			const isSelected = rowIndex === props.coords.rowIndex && columnIndex === props.coords.colIndex
			const navigationDisabled = props.columns[0][columnIndex]?.disableNavigation
			const column = props.columns[columnIndex]
			//Dummy zIndex is 0 and a spanned cell has 5 but a normal cell has 1
			const defaultZIndex = cell.dummy ? 0 : 1
			const zIndex = (cell.rowSpan || cell.colSpan) && !cell.dummy ? 5 : defaultZIndex
			const isRowActive = isActiveRow({ rowIndex, colIndex: columnIndex })
			const { theme } = props.apiRef.current
			const cellStyle: CSSProperties = { ...style }
			if (isSelected) {
				//Ensure there are no other borders
				cellStyle.borderLeft = '0px'
				cellStyle.borderRight = '0px'
				cellStyle.borderTop = '0px'
				cellStyle.borderBottom = '0px'
				cellStyle.border = props.highlightBorderColor
					? `1px solid ${props.highlightBorderColor}`
					: '1px solid blue'
			} else if (!theme || (!theme.cellClass && !cell.dummy)) {
				//Bind default border and clear other borders
				cellStyle.borderLeft = '0px'
				cellStyle.borderRight = '0px'
				cellStyle.borderTop = '0px'
				cellStyle.borderBottom = '0px'
				cellStyle.border = '1px solid rgb(204, 204, 204)'
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
						...cellStyle,
						justifyContent: cell?.dummy ? 'top' : 'center',
						zIndex,
					}}
					ref={ref}
				>
					{cell.value}
				</div>
			)
		},
		[
			classes,
			isActiveRow,
			props.apiRef,
			props.columns,
			props.coords.colIndex,
			props.coords.rowIndex,
			props.highlightBorderColor,
			props.selection,
		],
	)

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
		[props, cache, renderCell],
	)

	const onRefMount = useCallback(instance => {
		gridRef.current = instance
	}, [])

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
