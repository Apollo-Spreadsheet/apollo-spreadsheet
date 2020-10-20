import React, {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react'
import GridWrapper from './gridWrapper/GridWrapper'
import ColumnGrid from './columnGrid/ColumnGrid'
import { KeyDownEventParams, useNavigation } from './navigation/useNavigation'
import { StretchMode } from './types/stretch-mode.enum'
import { DisableSortFilterParam, GridWrapperCommonProps } from './gridWrapper/gridWrapperProps'
import { useMergeCells } from './mergeCells/useMergeCells'
import { NavigationCoords } from './navigation/types/navigation-coords.type'
import { useHeaders } from './columnGrid/useHeaders'
import { useData } from './data/useData'
import { ROW_SELECTION_HEADER_ID, useRowSelection } from './rowSelection/useRowSelection'
import { ClickAwayListener, IconButton, Tooltip, useForkRef } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import { SelectionProps } from './rowSelection/selectionProps'
import { useEditorManager } from './editorManager/useEditorManager'
import { createPortal } from 'react-dom'
import { orderBy } from 'lodash'
import { GridContainer, GridContainerCommonProps } from './gridContainer/GridContainer'
import { ScrollSync } from 'react-virtualized'
import { useApiRef } from './api/useApiRef'
import { ApiRef } from './api/types/apiRef'
import { useApiFactory } from './api/useApiFactory'
import { makeStyles } from '@material-ui/core/styles'
import { useEvents } from './events/useEvents'
import { useApiEventHandler } from './api/useApiEventHandler'
import { CELL_CLICK, CELL_DOUBLE_CLICK } from './api/eventConstants'

const useStyles = makeStyles(() => ({
	root: {
		height: '100%',
		width: '100%',
	},
}))

interface Props<TRow = any> extends GridWrapperCommonProps, GridContainerCommonProps {
	className?: string
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
	onCreateRow?: (coords: NavigationCoords) => void
	/**
	 * Indicates if the sort is disabled globally or on a specific column
	 * @default true **/
	disableSort?: boolean | DisableSortFilterParam
	/**
	 * Providing a custom ApiRef will override internal ref by allowing the exposure of grid methods
	 */
	apiRef?: ApiRef
}

export const ApolloSpreadSheet = forwardRef(
	(props: Props, componentRef: React.Ref<HTMLDivElement>) => {
		const classes = useStyles()
		const minColumnWidth = props.minColumnWidth ?? 60
		const [gridFocused, setGridFocused] = useState(true)
		const defaultApiRef = useApiRef()
		const apiRef = React.useMemo(() => (!props.apiRef ? defaultApiRef : props.apiRef), [
			props.apiRef,
			defaultApiRef,
		])
		const rootContainerRef = useRef<HTMLDivElement>(null)
		const forkedRef = useForkRef(rootContainerRef, componentRef)
		const initialised = useApiFactory(rootContainerRef, apiRef)
		// console.log({
		// 	initialised,
		// 	forkedRef,
		//
		// 	apiRef: apiRef.current,
		// })

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
				accessor: ROW_SELECTION_HEADER_ID,
				width: '2%',
			})
			return newHeaders
		}, [props.headers, props.selection])

		useEvents(rootContainerRef, apiRef)

		useMergeCells({
			data: props.mergeCells,
			rowCount: rows.length,
			columnCount: headers.length,
			apiRef,
			initialised,
		})

		const data = useData({
			rows,
			headers,
			selection: props.selection,
			apiRef,
			initialised,
		})

		useRowSelection({
			selection: props.selection,
			apiRef,
			initialised,
		})


		const { headersData, getColumnAt, dynamicColumnCount } = useHeaders({
			headers,
			nestedHeaders: props.nestedHeaders,
			minColumnWidth,
		})


		const editorNode = useEditorManager({
			rows,
			getColumnAt,
			onCellChange: props.onCellChange,
			apiRef,
			initialised,
		})

		const [coords, selectCell] = useNavigation({
			defaultCoords: props.defaultCoords ?? {
				rowIndex: 0,
				colIndex: 0,
			},
			data,
			columnCount: headers.length,
			suppressControls: props.suppressNavigation || !gridFocused,
			getColumnAt,
			onCellChange: props.onCellChange,
			onCreateRow: props.onCreateRow,
			apiRef,
			initialised,
		})

		/** @todo Extract to useSort hook **/
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

		const onClickAway = useCallback(() => {
			if (!gridFocused) {
				return
			}
			if (props.outsideClickDeselects) {
				setGridFocused(false)
				selectCell({
					rowIndex: -1,
					colIndex: -1,
				})
			}
		}, [props.outsideClickDeselects, selectCell, gridFocused])

		//Detect if any element is clicked again to enable focus
		const onCellMouseHandler = useCallback(() => {
			if (!gridFocused) {
				setGridFocused(true)
			}
		}, [gridFocused])

		useApiEventHandler(apiRef, CELL_CLICK, onCellMouseHandler)
		useApiEventHandler(apiRef, CELL_DOUBLE_CLICK, onCellMouseHandler)

		return (
			<ClickAwayListener onClickAway={onClickAway}>
				<div ref={forkedRef} className={classes.root}>
					<GridContainer
						headers={headers}
						minColumnWidth={minColumnWidth}
						dynamicColumnCount={dynamicColumnCount}
						stretchMode={props.stretchMode ?? StretchMode.All}
						containerClassName={props.containerClassName}
					>
						{({ getColumnWidth, width, columnGridRef, height, mainGridRef, registerChild }) => (
							<ScrollSync>
								{({ scrollLeft, onScroll }) => (
									<div id="apollo-grids" className={props.className}>
										<ColumnGrid
											data={headersData}
											headers={headers}
											width={width}
											defaultColumnWidth={minColumnWidth}
											getColumnWidth={getColumnWidth}
											ref={columnGridRef}
											minRowHeight={props.minColumnHeight ?? 50}
											scrollLeft={scrollLeft}
											// isScrolling={isScrolling}
											theme={props.theme}
											coords={coords}
											stretchMode={props.stretchMode}
											nestedHeaders={props.nestedHeaders}
											overscanColumnCount={props.overscanColumnCount}
											overscanRowCount={props.overscanRowCount}
											onSortClick={onSortClick}
											sort={sort}
											disableSort={props.disableSort}
										/>
										<GridWrapper
											rows={rows}
											data={data}
											overscanColumnCount={props.overscanColumnCount}
											overscanRowCount={props.overscanRowCount}
											registerChild={registerChild}
											defaultColumnWidth={minColumnWidth}
											width={width}
											getColumnWidth={getColumnWidth}
											minRowHeight={props.minRowHeight ?? 50}
											ref={mainGridRef}
											scrollLeft={scrollLeft}
											onScroll={onScroll}
											//		isScrolling={isScrolling}
											height={height}
											columnCount={headers.length}
											coords={coords}
											headers={headers}
											onGridReady={props.onGridReady}
											defaultCoords={props.defaultCoords}
											suppressNavigation={props.suppressNavigation}
											outsideClickDeselects={props.outsideClickDeselects}
											onCellChange={props.onCellChange}
											theme={props.theme}
											stretchMode={props.stretchMode ?? StretchMode.All}
											apiRef={apiRef}
											scrollToAlignment={props.scrollToAlignment}
										/>
									</div>
								)}
							</ScrollSync>
						)}
					</GridContainer>
					{editorNode && createPortal(editorNode, document.body)}
				</div>
			</ClickAwayListener>
		)
	},
)

export default ApolloSpreadSheet
