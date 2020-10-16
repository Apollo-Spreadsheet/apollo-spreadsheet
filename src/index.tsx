import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from "react"
import GridWrapper from "./gridWrapper/GridWrapper"
import ColumnGrid from "./columnGrid/ColumnGrid"
import { KeyDownEventParams, useNavigation } from "./navigation/useNavigation"
import { StretchMode } from "./types/stretch-mode.enum"
import { DisableSortFilterParam, GridWrapperCommonProps } from "./gridWrapper/gridWrapperProps"
import { useMergeCells } from "./mergeCells/useMergeCells"
import { NavigationCoords } from "./navigation/types/navigation-coords.type"
import { useHeaders } from "./columnGrid/useHeaders"
import { useData } from "./data/useData"
import { ROW_SELECTION_HEADER_ID, useRowSelection } from "./rowSelection/useRowSelection"
import { ClickAwayListener, IconButton, Tooltip } from "@material-ui/core"
import DeleteIcon from "@material-ui/icons/Delete"
import { SelectionProps } from "./rowSelection/selectionProps"
import { useEditorManager } from "./editorManager/useEditorManager"
import { createPortal } from "react-dom"
import { orderBy } from "lodash"
import { GridContainer, GridContainerCommonProps } from "./gridContainer/GridContainer"
import { ScrollSync } from "react-virtualized"

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
}

interface ApolloSpreadSheetRef {
	selectedCell: NavigationCoords
	rowCount: number
	columnCount: number
}

export const ApolloSpreadSheet = forwardRef(
	(props: Props, componentRef: React.Ref<ApolloSpreadSheetRef>) => {
		const minColumnWidth = props.minColumnWidth ?? 60
		const [gridFocused, setGridFocused] = useState(true)

		const restoreGridFocus = useCallback(() => {
			if (gridFocused) {
				return
			}
			setGridFocused(true)
		}, [gridFocused])

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

		const [coords, selectCell] = useNavigation({
			defaultCoords: props.defaultCoords ?? {
				rowIndex: 0,
				colIndex: 0,
			},
			data,
			rows,
			columnCount: headers.length,
			suppressControls: props.suppressNavigation || !gridFocused,
			getColumnAt,
			onCellChange: props.onCellChange,
			beginEditing,
			stopEditing,
			editorState,
			selectRow,
			onCreateRow: props.onCreateRow,
		})

		//Public api from plugin to extensible hooks or external ref
		const api: ApolloSpreadSheetRef = useMemo(() => {
			return {
				rowCount,
				columnCount: headers.length,
				selectedCell: coords,
				getSelectedRows: getSelectedRows,
				selectCell,
			}
		}, [coords, rowCount, headers.length, getSelectedRows, selectCell])

		useImperativeHandle(componentRef, () => api)

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

		return (
			<>
				<GridContainer
					headers={headers}
					minColumnWidth={minColumnWidth}
					dynamicColumnCount={dynamicColumnCount}
					stretchMode={props.stretchMode ?? StretchMode.All}
					containerClassName={props.containerClassName}
				>
					{({ getColumnWidth, width, columnGridRef, height, mainGridRef, registerChild }) => (
						<ClickAwayListener onClickAway={onClickAway}>
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
											selectCell={selectCell}
											/** Public API **/
											headers={headers}
											onGridReady={props.onGridReady}
											defaultCoords={props.defaultCoords}
											suppressNavigation={props.suppressNavigation}
											outsideClickDeselects={props.outsideClickDeselects}
											onCellChange={props.onCellChange}
											theme={props.theme}
											mergeCells={mergeData}
											mergedPositions={mergedPositions}
											stretchMode={props.stretchMode ?? StretchMode.All}
											/** @todo Improve in the future to read directly from the hook and avoid this **/
											editorState={editorState}
											beginEditing={beginEditing}
											stopEditing={stopEditing}
											scrollToAlignment={props.scrollToAlignment}
											restoreGridFocus={restoreGridFocus}
										/>
										</div>
									)}
								</ScrollSync>
						</ClickAwayListener>
					)}
				</GridContainer>
				{editorNode && createPortal(editorNode, document.body)}
			</>
		)
	},
)

export default ApolloSpreadSheet
