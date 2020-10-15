import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react'
import GridWrapper from './gridWrapper/GridWrapper'
import { makeStyles } from '@material-ui/core/styles'
import ColumnGrid from './columnGrid/ColumnGrid'
import { KeyDownEventParams, useNavigation } from './navigation/useNavigation'
import { StretchMode } from './types/stretch-mode.enum'
import { GridWrapperCommonProps } from './gridWrapper/gridWrapperProps'
import { useMergeCells } from './mergeCells/useMergeCells'
import { NavigationCoords } from './navigation/types/navigation-coords.type'
import { useHeaders } from './columnGrid/useHeaders'
import { useData } from './data/useData'
import { ROW_SELECTION_HEADER_ID, useRowSelection } from './rowSelection/useRowSelection'
import { ClickAwayListener, IconButton, Tooltip } from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import { SelectionProps } from './rowSelection/selectionProps'
import { useEditorManager } from './editorManager/useEditorManager'
import { createPortal } from 'react-dom'
import { orderBy } from 'lodash'
import { GridContainer } from './gridContainer/GridContainer'

/** @todo Make it 15 or 10 to be a little bit wider **/
const useStyles = makeStyles(() => ({
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
	apolloRoot: {
		height: '100%',
		width: '100%',
		flex: 1,
		display: 'flex'
	},
	bodyContainer: {
		outline: 'none',
		// 'scrollbar-width': 'none',
		// '&::-webkit-scrollbar': {
		// 	display: 'none',
		// },
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
		const minColumnWidth = props.minColumnWidth ?? 60
		const [focused, setFocused] = useState(true)
		const rootRef = useRef<HTMLDivElement | null>(null)
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
			suppressNavigation: props.suppressNavigation ?? false,
			getColumnAt,
			onCellChange: props.onCellChange,
			beginEditing,
			stopEditing,
			editorState,
			selectRow,
		})

		//Public api from plugin to extensible hooks or external ref
		const api: ApolloSpreadSheetRef = useMemo(() => {
			return {
				rowCount,
				columnCount: headers.length,
				selectedCell: coords,
				getSelectedRows: getSelectedRows
			}
		}, [coords, rowCount, headers.length, getSelectedRows])

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

		const handleDocumentClick = (e) => {
			console.error('On click')
			console.log(e.target)
			console.log(rootRef.current)

			if (rootRef.current?.contains(e.target) && !focused) {
				console.error("FOCUS YEA")
				setFocused(true)
			} else {
				if (!focused){
					return
				}
				console.warn("OUTSIDE")
				setFocused(false)
				selectCell({
					rowIndex: -1,
					colIndex: -1,
				})
			}
		}
		console.log({ focused, coords })
		/** @todo Need to review this part **/
		// useEffect(() => {
		// 	document.addEventListener('click', handleDocumentClick)
		// 	return () => {
		// 		document.removeEventListener('click', handleDocumentClick)
		// 	}
		// }, [focused, props.outsideClickDeselects, selectCell])

		// const onClickAway = useCallback(() => {
		// 	if (props.outsideClickDeselects && focused) {
		// 		setFocused(false)
		// 		selectCell({
		// 			rowIndex: -1,
		// 			colIndex: -1,
		// 		})
		// 	}
		// }, [props.outsideClickDeselects, focused])

		return (
				<div className={classes.apolloRoot} ref={rootRef}>
					<GridContainer
						headers={headers}
						minColumnWidth={minColumnWidth}
						dynamicColumnCount={dynamicColumnCount}
						stretchMode={props.stretchMode ?? StretchMode.All}
					>
						{({ getColumnWidth, width, columnGridRef, height, mainGridRef, registerChild }) => (
							<>
								<ColumnGrid
									data={headersData}
									headers={headers}
									className={classes.headerContainer}
									width={width}
									defaultColumnWidth={minColumnWidth}
									getColumnWidth={getColumnWidth}
									ref={columnGridRef}
									minRowHeight={props.minColumnHeight ?? 50}
									// scrollLeft={scrollLeft}
									// isScrolling={isScrolling}
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
									registerChild={registerChild}
									defaultColumnWidth={minColumnWidth}
									width={width}
									getColumnWidth={getColumnWidth}
									minRowHeight={props.minRowHeight ?? 50}
									ref={mainGridRef}
									//		scrollLeft={scrollLeft}
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
									/** @todo Improve in the future to read directly from the hook and avoid this **/
									editorState={editorState}
									beginEditing={beginEditing}
									stopEditing={stopEditing}
									scrollToAlignment={props.scrollToAlignment}
								/>
							</>
						)}
					</GridContainer>
					{editorNode && createPortal(editorNode, document.body)}
				</div>
		)
	},
)

export default ApolloSpreadSheet
