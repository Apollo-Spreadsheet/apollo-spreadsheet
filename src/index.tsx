import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react'
import { AutoSizer, ColumnSizer } from 'react-virtualized'
import HorizontalScroll from './horizontalScroll/HorizontalScroll'
import GridWrapper from './gridWrapper/GridWrapper'
import { makeStyles } from '@material-ui/core/styles'
import ColumnGrid from './columnGrid/ColumnGrid'
import { KeyDownEventParams, useNavigation } from './navigation/useNavigation'
import { StretchMode } from './types/stretch-mode.enum'
import { GridWrapperCommonProps } from './gridWrapper/gridWrapperProps'
import { ScrollHandlerRef } from './horizontalScroll/horizontalScrollProps'
import { useMergeCells } from './mergeCells/useMergeCells'
import { NavigationCoords } from './navigation/types/navigation-coords.type'
import { FixedColumnWidthRecord, useHeaders } from './columnGrid/useHeaders'
import shallowDiffers from './helpers/shallowDiffers'
import { createFixedWidthMapping } from './columnGrid/utils/createFixedWidthMapping'
import { Header } from './columnGrid/types/header.type'
import { useData } from './data/useData'
import { ROW_SELECTION_HEADER_ID, useRowSelection } from './rowSelection/useRowSelection'
import { IconButton, Tooltip } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import { SelectionProps } from './rowSelection/selectionProps'
import { useEditorManager } from './editorManager/useEditorManager'
import { createPortal } from 'react-dom'
import { orderBy } from 'lodash'

export const CONTAINER_SCROLL_WIDTH = 5
/** @todo Make it 15 or 10 to be a little bit wider **/
const useStyles = makeStyles(() => ({
	root: {
		height: '100%',
		overflowY: 'hidden',
		overflowX: 'hidden',
		/** @todo Max height must be removed, this is just experimental **/
		maxHeight: 500,
		margin: 15,
		'&:hover': {
			overflowY: 'auto',
		},
		'&::-webkit-scrollbar-track': {
			borderRadius: '10px',
			opacity: 0.5,
			'-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,.3)',
		},
		'&::-webkit-scrollbar': {
			width: `${CONTAINER_SCROLL_WIDTH}px`,
			opacity: 0.5,
		},
		'&::-webkit-scrollbar-thumb': {
			borderRadius: '10px',
			opacity: 0.5,
			'-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,.3)',
		},
	},
	headerContainer: {
		outline: 'none',
		// position: "-webkit-sticky !important" as any,
		position: 'sticky !important' as any,
		top: 0,
		zIndex: 1,
		'scrollbar-width': 'none',
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	},
	bodyContainer: {
		outline: 'none',
		'scrollbar-width': 'none',
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	},
}))

interface Props<TRow = any> extends GridWrapperCommonProps {
	rows: TRow[]
	/** @default 50 **/
	minRowHeight?: number
	/** @default 50 **/
	minColumnHeight?: number
	/** @default 50 **/
	minColumnWidth?: number
	fixedColumnCount: number
	/** @default StretchMode.None  */
	stretchMode?: StretchMode
	onKeyDown?: (params: KeyDownEventParams) => void
	selection?: SelectionProps<TRow>
	/**
	 * @todo Maybe accept a function to indicate if a column can or not be sortable
	 * @default true **/
	disableSort?: boolean
}

interface ApolloSpreadSheetRef {
	selectedCell: NavigationCoords
	rowCount: number
	columnCount: number
}

export const ApolloSpreadSheet = forwardRef(
	(props: Props, componentRef: React.Ref<ApolloSpreadSheetRef>) => {
		const classes = useStyles()

		const gridContainerRef = useRef<HTMLDivElement | null>(null)
		const minColumnWidth = props.minColumnWidth ?? 60
		const scrollHandlerRef = useRef<ScrollHandlerRef | null>(null)
		const fixedColumnWidths = useRef<FixedColumnWidthRecord>({
			totalSize: 0,
			mapping: {},
		})
		const latestContainerWidth = useRef(0)
		const latestColumns = useRef<Header[]>([])
		const [sort, setSort] = useState<{
			field: string
			order: 'asc' | 'desc'
		} | null>(null)

		const rows = useMemo(() => {
			if (sort) {
				return orderBy(props.rows, [sort.field], [sort.order])
			}
			return props.rows
		}, [sort, props.rows])

		const rowCount = rows.length

		useEffect(() => {
			gridContainerRef.current?.focus()
		})
		const headers = useMemo(() => {
			if (!props.selection) {
				return props.headers
			}

			//Bind our selection header
			const newHeaders = [...props.headers]
			newHeaders.push({
				colSpan: 1,
				id: ROW_SELECTION_HEADER_ID,
				title: '',
				renderer: () => {
					return (
						<Tooltip placement={'top'} title={'Click to delete the selected rows'}>
							<IconButton onClick={props.selection?.onHeaderIconClick}>
								<DeleteIcon />
							</IconButton>
						</Tooltip>
					)
				},
				disableNavigation: true,
				accessor: ROW_SELECTION_HEADER_ID,
				width: '2%',
			})
			return newHeaders
		}, [props.headers, props.selection])

		const { headersData, getColumnAt, dynamicColumnCount } = useHeaders({
			headers,
			nestedHeaders: props.nestedHeaders,
			minColumnWidth,
		})

		const { isRowSelected, selectRow, getSelectedRows } = useRowSelection({
			rows,
			selection: props.selection,
		})

		const {
			mergeData,
			getMergedPath,
			getSpanProperties,
			isMerged,
			mergedPositions,
		} = useMergeCells({
			data: props.mergeCells,
			rowCount: rows.length,
			columnCount: headers.length,
		})

		const { data } = useData({
			rows,
			headers,
			mergeCells: mergeData,
			mergedPositions,
			selection: props.selection,
			isRowSelected,
			selectRow,
		})

		const { editorNode, editorState, beginEditing, stopEditing } = useEditorManager({
			rows,
			getColumnAt,
			onCellChange: props.onCellChange,
		})

		const [coords, selectCell, onCellClick] = useNavigation({
			defaultCoords: props.defaultCoords ?? {
				rowIndex: 0,
				colIndex: 0,
			},
			data,
			rows,
			columnCount: headers.length,
			suppressNavigation: props.suppressNavigation ?? false,
			getColumnAt,
			onCellChange: props.onCellChange,
			beginEditing,
			stopEditing,
			editorState,
		})

		//Public api from plugin to extensible hooks or external ref
		const api: ApolloSpreadSheetRef = useMemo(() => {
			return {
				rowCount,
				columnCount: headers.length,
				selectedCell: coords,
			}
		}, [coords, rowCount, headers.length])

		useImperativeHandle(componentRef, () => api)

		const getTotalColumnWidth = useCallback(
			getColumnWidth => {
				let value = 0
				for (let i = 0; i < headers.length; i++) {
					value += getColumnWidthHelper(getColumnWidth)({ index: i })
				}
				return value - CONTAINER_SCROLL_WIDTH
			},
			[headers.length],
		)

		/**
		 * Helper that facades with getColumnWidth function provided by react-virtualize and either returns
		 * the fixed width from our mapping or fetches directly from react-virtualize
		 * @param getColumnWidth
		 */
		//https://github.com/bvaughn/react-virtualized/issues/698
		const getColumnWidthHelper = getColumnWidth => ({ index }: { index: number }) => {
			return fixedColumnWidths.current.mapping[index] ?? getColumnWidth({ index })
		}

		const buildColumnTotalWidth = (containerWidth: number) => {
			//Cached value
			if (
				!shallowDiffers(headers, latestColumns.current) &&
				latestContainerWidth.current === containerWidth
			) {
				return containerWidth - fixedColumnWidths.current.totalSize - CONTAINER_SCROLL_WIDTH
			}

			const { mapping, totalSize } = createFixedWidthMapping(
				headers,
				containerWidth,
				minColumnWidth,
				props.stretchMode ?? StretchMode.None,
				CONTAINER_SCROLL_WIDTH,
			)

			//Just update with the new calculated (if it was otherwise it might have been a cached result)
			fixedColumnWidths.current = {
				totalSize,
				mapping,
			}

			//Store if it has changed
			if (shallowDiffers(headers, latestColumns.current)) {
				latestColumns.current = headers
			}
			if (latestContainerWidth.current !== containerWidth) {
				latestContainerWidth.current = containerWidth
			}

			//The available width that the grid will use
			return Math.max(
				0,
				containerWidth - fixedColumnWidths.current.totalSize - CONTAINER_SCROLL_WIDTH,
			)
		}

		function onSortClick(field: string) {
			if (field === sort?.field) {
				const nextSort = sort?.order === 'asc' ? 'desc' : 'asc'
				if (nextSort === 'asc') {
					setSort(null)
				} else {
					setSort({
						field,
						order: nextSort,
					})
				}
			} else {
				setSort({
					field,
					order: 'asc',
				})
			}
		}

		const renderGridsWrapper = (containerWidth: number) => {
			return (
				<>
					<ColumnSizer
						columnMinWidth={minColumnWidth}
						columnCount={dynamicColumnCount}
						width={buildColumnTotalWidth(containerWidth)}
					>
						{({ registerChild, getColumnWidth }) => (
							<HorizontalScroll
								scrollContainer={gridContainerRef.current}
								width={containerWidth - CONTAINER_SCROLL_WIDTH}
								totalColumnWidth={getTotalColumnWidth(getColumnWidth)}
								stretchMode={props.stretchMode ?? StretchMode.None}
								ref={scrollHandlerRef}
							>
								{({ scrollTop, scrollLeft, isScrolling, gridRef, headerRef, height }) => (
									<>
										<ColumnGrid
											data={headersData}
											headers={headers}
											className={classes.headerContainer}
											width={containerWidth + fixedColumnWidths.current.totalSize}
											defaultColumnWidth={minColumnWidth}
											getColumnWidth={getColumnWidthHelper(getColumnWidth)}
											ref={headerRef}
											minRowHeight={props.minColumnHeight ?? 50}
											scrollLeft={scrollLeft}
											isScrolling={isScrolling}
											height={height}
											theme={props.theme}
											coords={coords}
											stretchMode={props.stretchMode}
											nestedHeaders={props.nestedHeaders}
											overscanColumnCount={props.overscanColumnCount}
											overscanRowCount={props.overscanRowCount}
											onSortClick={onSortClick}
											sort={sort}
										/>
										<GridWrapper
											rows={rows}
											data={data}
											overscanColumnCount={props.overscanColumnCount}
											overscanRowCount={props.overscanRowCount}
											className={classes.bodyContainer}
											scrollTop={scrollTop}
											registerChild={registerChild}
											defaultColumnWidth={minColumnWidth}
											width={containerWidth + fixedColumnWidths.current.totalSize}
											getColumnWidth={getColumnWidthHelper(getColumnWidth)}
											minRowHeight={props.minRowHeight ?? 50}
											ref={gridRef}
											scrollLeft={scrollLeft}
											isScrolling={isScrolling}
											height={height}
											columnCount={headers.length}
											coords={coords}
											selectCell={selectCell}
											onCellClick={onCellClick}
											/** Public API **/
											headers={headers}
											onGridReady={props.onGridReady}
											defaultCoords={props.defaultCoords}
											suppressNavigation={props.suppressNavigation}
											outsideClickDeselects={props.outsideClickDeselects}
											gridContainerRef={gridContainerRef.current}
											onCellChange={props.onCellChange}
											theme={props.theme}
											mergeCells={mergeData}
											/** @todo Improve in the future to read directly from the hook and avoid this **/
											editorState={editorState}
											beginEditing={beginEditing}
											stopEditing={stopEditing}
										/>
									</>
								)}
							</HorizontalScroll>
						)}
					</ColumnSizer>
				</>
			)
		}

		return (
			<div id="grid-container" className={classes.root} ref={gridContainerRef}>
				<AutoSizer disableHeight>{({ width }) => renderGridsWrapper(width)}</AutoSizer>
				{editorNode && createPortal(editorNode, gridContainerRef.current ?? document.body)}
			</div>
		)
	},
)

export default ApolloSpreadSheet
