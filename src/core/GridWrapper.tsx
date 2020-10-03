import React, {
	useRef,
	useEffect,
	useMemo,
	useCallback,
	useImperativeHandle,
	forwardRef,
	useState,
} from "react"
import PropTypes from "prop-types"
import {Grid, CellMeasurerCache, ScrollParams} from "react-virtualized"
import CellMeasurer from "./CellMeasureWrapper"
import {insertDummyCells} from "../utils/helpers"
import {useLazyRef} from "../hooks/useLazyRef"
import {HeadersData} from "../column-grid/types/header.type"
import {GridData, GridRow} from "../types/row.interface"
import {IGridApi} from "../types/grid-api.type"
import {NavigationCoords} from "../navigation/types/navigation-coords.type"
import {SelectCellFn, useNavigation} from "../navigation/useNavigation"
import TextEditor from "../editors/TextEditor"
import {createPortal} from "react-dom"
import {ClickAwayListener} from "@material-ui/core"
import {GridTheme} from "../types/grid-theme"
import clsx from "clsx"
import {GridCellProps} from "react-virtualized/dist/es/Grid"

export interface ICellMountedRegisterData {
	colIndex: number;
	rowIndex: number;
	elementNodeRef: Element;
}

export interface ICellNodeInfo {
	rowIndex: number;
	colIndex: number;
	elementNodeRef: Element;
}

export interface CellChangeParams {
	rowIndex: number;
	columnIndex: number;
	previousValue: any;
	value: unknown;
}

export interface GridWrapperCommonProps {
	headers: HeadersData;
	// data: GridData;
	/** @default { rowIndex: 0, colIndex: 0} **/
	defaultCoords?: NavigationCoords;
	/** @default false **/
	suppressNavigation?: boolean;
	/** @default false **/
	outsideClickDeselects?: boolean;
	onGridReady?: (gridRef: IGridApi) => void;
	theme?: GridTheme;
	onCellChange: (params: CellChangeParams) => void;
}

interface Props extends GridWrapperCommonProps {
	className: string;
	minRowHeight: number;
	defaultColumnWidth: number
	width: number;
	scrollLeft: number;
	scrollTop: number;
	isScrolling: boolean;
	onScroll: (params: ScrollParams) => any;
	height: number;
	registerChild: Function;
	gridContainerRef: HTMLDivElement | null;
	coords: NavigationCoords;
	rows: Array<GridRow>;
	columnCount: number;
	selectCell: SelectCellFn;
	onCellClick: (
	  params: NavigationCoords & { event: React.MouseEvent<HTMLDivElement> }
	) => void;
	getColumnWidth: ({index}: { index: number }) => number
}

const GridWrapper = forwardRef((props: Props, componentRef: any) => {
	const cache = useRef(new CellMeasurerCache({
		defaultWidth: props.defaultColumnWidth,
		defaultHeight: props.minRowHeight,
		fixedWidth: true,
		minHeight: props.minRowHeight,
		minWidth: props.defaultColumnWidth,
	})).current

	const gridRef = useRef<Grid | null>(null)

	/**
	 * Returns a given column at the provided index if exists
	 * @param index
	 * @param line  This represents the row but by default we fetch only from the first, this is in order to support nested headers
	 */
	const getColumnAt = useCallback(
	  (index: number, line = 0) => {
		  return props.headers[line]?.[index]
	  },
	  [props.headers]
	)

	const [activeEditor, setActiveEditor] = useState<{
		row: GridRow;
		rowIndex: number;
		colIndex: number;
		editor: JSX.Element;
	} | null>(null)
	const [focused, setFocused] = useState(true)

	const gridApi = () => {
		return {
			recomputeGridSize: () => {
				gridRef.current?.recomputeGridSize()
			},
			forceUpdate: () => {
				gridRef.current?.forceUpdate()
			},
			getRowsCount: () => props.rows.length,
			getRowAt: getColumnAt,
			getCellAt: ({rowIndex, colIndex}: NavigationCoords) => {
				return props.rows[rowIndex]?.[colIndex]
			},
			getColumnAt,
			// getSelectedCell: () => props.coords,
			getActiveEditor: () => activeEditor,
			isEditing: () => !!activeEditor,
			selectedCell: (_cellCoords: NavigationCoords) =>
			  props.selectCell(_cellCoords),
		}
	}

	useImperativeHandle(
	  componentRef,
	  () => {
		  return gridApi()
	  },
	  [props.rows, getColumnAt, activeEditor, gridRef.current]
	)

	// clear cache and recompute when data changes
	useEffect(() => {
		cache.clearAll()
		gridRef.current?.recomputeGridSize()
	}, [props.rows])

	const openEditor = (
	  row: any,
	  rowIndex: number,
	  colIndex: number,
	  anchorRef: Element,
	  cellWidth: React.ReactText,
	  cellHeight: React.ReactText,
	  defaultValue: any
	) => {
		if (activeEditor) {
			return
		}
		const column = props.headers[0][colIndex]
		if (!column) {
			return console.error("Column not found at index " + colIndex)
		}
		const isReadOnly = column.readOnly
		  ? typeof column.readOnly === "function"
			? column.readOnly(row, column)
			: column.readOnly
		  : false

		if (isReadOnly) {
			return
		}

		const value = defaultValue ?? ""
		// const onCommitCancel = (navigationKey?: NavigationKey) => {
		// 	setActiveEditor(null)
		// 	if (navigationKey) {
		// 		handleNavigation(navigationKey)
		// 	}
		// }
		const onCommitCancel = () => {
			setActiveEditor(null)
		}

		const onCommit = (value: unknown) => {
			/** @todo We need to know which key was been used **/
			// 	if (navigationKey) {
			// 		handleNavigation(navigationKey)
			// 	}
			if (value !== defaultValue) {
				props.onCellChange({
					rowIndex,
					columnIndex: colIndex,
					previousValue: defaultValue,
					value,
				})
			}
			setActiveEditor(null)
		}

		/**@todo Use this soon  **/
		  // const editor = column.editor ? getColumnEditor(column.editor): (
		  // 	<TextEditor
		  // 		maxHeight={maxHeight}
		  // 		anchorRef={anchorRef}
		  // 		cellStyle={cellStyle}
		  // 		value={value}
		  // 		onCommit={onCommit}
		  // 		onCommitCancel={onCommitCancel}
		  // 		/**@todo Column must defined this **/
		  // 		maxLength={500}
		  // 	/>
		  // )
		const editor = (
			<TextEditor
			  anchorRef={anchorRef}
			  cellWidth={cellWidth}
			  cellHeight={cellHeight}
			  value={value}
			  onCommit={onCommit}
			  onCommitCancel={onCommitCancel}
			  /**@todo Column must defined this **/
			  maxLength={500}
			/>
		  )

		setActiveEditor({
			row,
			rowIndex,
			colIndex,
			editor,
		})
	}

	const onCellDoubleClick = useCallback(
	  (e, cell, rowIndex, colIndex, defaultValue) => {
		  e.preventDefault()
		  if (cell?.dummy) {
			  return
		  }
		  if (!focused) {
			  setFocused(true)
		  }

		  const row = props.rows[rowIndex]
		  openEditor(
			row,
			rowIndex,
			colIndex,
			e.target as any,
			e.target["style"].width,
			e.target["style"].height,
			defaultValue
		  )
	  },
	  [props.rows, activeEditor, focused]
	)

	const onCellClick = useCallback((event: any, cell: any, rowIndex: number, columnIndex: number) => {
		if (cell?.dummy) {
			return
		}
		if (!focused) {
			setFocused(true)
		}
		props.onCellClick({rowIndex, colIndex: columnIndex, event})
	}, [focused, props.onCellClick])

	const renderCell = useCallback(
	  ({style, cell, ref, rowIndex, columnIndex}) => {
		  const {children} = cell
		  const isSelected =
			rowIndex === props.coords.rowIndex &&
			columnIndex === props.coords.colIndex
		  /**
		   * @todo Not considering well merged cells, i need to look up by merged too
		   */
		  const isRowSelected = rowIndex === props.coords.rowIndex
		  if (isSelected) {
			  style.border = "1px solid blue"
		  } else {
			  //Bind default border
			  if (!props.theme || !props.theme.rowClass) {
				  style.border = "1px solid rgb(204, 204, 204)"
			  }
		  }

		  //Non navigable columns get now a custom disable style
		  if (props.headers[0][columnIndex]?.disableNavigation) {
			  /** @todo We can apply the custom class if theme has it by using a class builder such as clsx **/
			  style.opacity = 0.6
		  }

		  /**
		   * @todo We need to check if the row is a dummy but its parent dummy is not anymore visible
		   * e.:g
		   * dummy 1 has a rowspawn of total 3 but none of its parent are visible, so dummy 3 assume the children value and highlight
		   * of the parent because there is none visible
		   * @todo Check if creating a lifecycle cell mount/unmount helps
		   * @todo The children renderer has to be controlled via the custom column configuration
		   * */

		  return (
			<div
			  className={
				  isRowSelected && props.theme?.currentRowClass
					? clsx(props.theme?.rowClass, props.theme?.currentRowClass)
					: props.theme?.rowClass
			  }
			  style={{
				  display: "flex",
				  justifyContent: cell?.dummy ? 'top' : "center",
				  padding: "5px",
				  boxSizing: "border-box",
				  ...style,
			  }}
			  onClick={(event) => onCellClick(event, cell, rowIndex, columnIndex)}
			  onDoubleClick={(e) => onCellDoubleClick(e, cell, rowIndex, columnIndex, children)}
			  ref={ref}
			>
				{typeof children === "function" ? children() : children}
			</div>
		  )
	  },
	  [props.coords, props.theme, props.onCellClick, props.headers, props.width]
	)

	const cellRenderer = useCallback(
	  ({rowIndex, columnIndex, key, parent, style, ...otherArgs}: GridCellProps) => {
		  const cell = props.rows[rowIndex]?.[columnIndex]

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
				  width: props.getColumnWidth({index: columnIndex}),
				  userSelect: "none",
			  }}
			  rendererProps={{
				  ...otherArgs,
				  style,
				  rowIndex,
				  columnIndex,
				  parent,
				  cell,
				  getColumnWidth: props.getColumnWidth
			  }}
			/>
		  ) : null
	  },
	  [props.rows, props.coords, props.theme, props.width]
	)

	const onRefMount = useCallback(
	  (instance) => {
		  //Pass down for react-virtualized under-layer
		  if (instance) {
			  props.registerChild(instance)
		  }

		  //Expose if needed
		  if (props.onGridReady && (componentRef as any).current) {
			  props.onGridReady((componentRef as any).current as IGridApi)
		  }
		  gridRef.current = instance
	  },
	  [props.onGridReady, props.registerChild, (componentRef as any).current]
	)

	const onClickAway = useCallback(() => {
		if (props.outsideClickDeselects && focused) {
			setFocused(false)
			props.selectCell({rowIndex: -1, colIndex: -1})
		}
	}, [props.outsideClickDeselects, focused])

	return (
	  <>
		  <ClickAwayListener onClickAway={onClickAway}>
			  <Grid
				{...props}
				ref={onRefMount}
				cellRenderer={cellRenderer}
				deferredMeasurementCache={cache}
				rowHeight={cache.rowHeight}
				rowCount={props.rows.length}
				columnCount={props.columnCount}
				overscanRowCount={2}
				overscanColumnCount={2}
				columnWidth={props.getColumnWidth}
				autoHeight
			  />
		  </ClickAwayListener>
		  {activeEditor &&
		  createPortal(
			activeEditor.editor,
			document.getElementById("grid-container") as HTMLElement
		  )}
	  </>
	)
})

export default GridWrapper
