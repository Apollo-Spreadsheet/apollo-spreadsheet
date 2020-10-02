import React, {forwardRef, useCallback, useMemo, useRef,} from "react";

import {AutoSizer, ColumnSizer} from "react-virtualized";
import ScrollHandler from "./core/ScrollHandler";
import GridWrapper, {GridWrapperCommonProps} from "./core/GridWrapper";
import {makeStyles} from "@material-ui/core/styles";
import ColumnGrid from "./column-grid/ColumnGrid";
import {useNavigation} from "./navigation/useNavigation";
import {GridData, GridRow} from "./types/row.interface";
import {insertDummyCells} from "./utils/helpers";
import {StretchMode} from "./types/stretch-mode.enum";
import {FixedColumnWidthRecord} from "./column-grid/types/fixed-column-width-record";
import {createFixedWidthMapping} from "./column-grid/utils/createFixedWidthMapping";
import {Column} from "./column-grid/types/header.type";
import shallowDiffers from "./utils/shallowDiffers";

const CONTAINER_SCROLL_WIDTH = 5;
/** @todo Make it 15 or 10 to be a little bit wider **/
const useStyles = makeStyles(() => ({
	root: {
		height: "100%",
		overflowY: "hidden",
		overflowX: "hidden",
		maxHeight: 500,
		margin: 15,
		"&:hover": {
			overflowY: "auto",
		},
		"&::-webkit-scrollbar-track": {
			borderRadius: "10px",
			opacity: 0.5,
			"-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,.3)",
		},
		"&::-webkit-scrollbar": {
			width: `${CONTAINER_SCROLL_WIDTH}px`,
			opacity: 0.5,
		},
		"&::-webkit-scrollbar-thumb": {
			borderRadius: "10px",
			opacity: 0.5,
			"-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,.3)",
		},
	},
	headerContainer: {
		outline: "none",
		// position: "-webkit-sticky !important" as any,
		position: "sticky !important" as any,
		top: 0,
		zIndex: 1,
		"scrollbar-width": "none",
		"&::-webkit-scrollbar": {
			display: "none",
		},
	},
	bodyContainer: {
		outline: "none",
		"scrollbar-width": "none",
		"&::-webkit-scrollbar": {
			display: "none",
		},
	},
}));

interface Props extends GridWrapperCommonProps {
	data: GridData;
	/** @default 50 **/
	minRowHeight?: number;
	/** @default 50 **/
	minColumnHeight?: number;
	/** @default 50 **/
	minColumnWidth?: number;
	fixedColumnCount: number;
	/** @default StretchMode.None  */
	stretchMode?: StretchMode
}


export const ApolloSpreadSheet = forwardRef(
  (props: Props, componentRef: any) => {
	  const classes = useStyles();
	  const columnCount = useMemo(() => {
		  return props.data.length ? props.data[0].length : 0;
	  }, [props.data]);

	  const gridContainerRef = useRef<HTMLDivElement | null>(null);
	  const minColumnWidth = props.minColumnWidth ?? 60
	  const rows: Array<GridRow> = useMemo(() => {
		  return insertDummyCells(props.data);
	  }, [props.data]);

	  /**
	   * Stores the main headers only, nested headers are not required in here
	   * because this is used as an utility
	   */
	  const mainHeaders: Column[] = useMemo(() => {
		  if (Array.isArray(props.headers[0])) {
			  return props.headers[0] as Column[]
		  }
		  return props.headers as Column[]
	  }, [props.headers])

	  /**
	   * Returns a given column at the provided index if exists
	   * @param index
	   * @param line  This represents the row but by default we fetch only from the first, this is in order to support nested headers
	   */
	  const getColumnAt = useCallback(
		(index: number, line = 0) => {
			return props.headers[line]?.[index];
		},
		[props.headers]
	  );

	  const [coords, selectCell, onCellClick] = useNavigation({
		  defaultCoords: props.defaultCoords ?? {rowIndex: 0, colIndex: 0},
		  /** @todo Dont pass the data but a callback so it can read the row/cell from */
		  data: rows,
		  gridRootRef: gridContainerRef.current,
		  columnsCount: columnCount,
		  rowsCount: rows.length,
		  suppressNavigation: props.suppressNavigation ?? false,
		  getColumnAt,
	  });


	  const fixedColumnWidths = useRef<{ totalSize: number, mapping: FixedColumnWidthRecord }>({
		  totalSize: 0,
		  mapping: {}
	  })
	  const latestContainerWidth = useRef(0)
	  const latestColumns = useRef<Column[]>([])

	  const buildColumnTotalWidth = (containerWidth: number) => {
		  //Cached value
		  if (!shallowDiffers(mainHeaders, latestColumns.current) && latestContainerWidth.current === containerWidth) {
			  return (containerWidth - fixedColumnWidths.current.totalSize) - CONTAINER_SCROLL_WIDTH
		  }

		  const {mapping, totalSize} = createFixedWidthMapping(mainHeaders, containerWidth, minColumnWidth, props.stretchMode ?? StretchMode.None, CONTAINER_SCROLL_WIDTH)

		  //Just update with the new calculated (if it was otherwise it might have been a cached result)
		  fixedColumnWidths.current = {
			  totalSize,
			  mapping
		  }

		  //Store if it has changed
		  if (shallowDiffers(mainHeaders, latestColumns.current)) {
			  latestColumns.current = mainHeaders as Column[]
		  }
		  if (latestContainerWidth.current !== containerWidth) {
			  latestContainerWidth.current = containerWidth
		  }

		  //The available width that the grid will use
		  return Math.max(0, (containerWidth - fixedColumnWidths.current.totalSize) - CONTAINER_SCROLL_WIDTH)
	  }

	  /**
	   * @todo Also we need to support nested headers which means which i'm not sure its okay
	   * @param getColumnWidth
	   */
		//https://github.com/bvaughn/react-virtualized/issues/698
	  const getColumnWidthHelper = (getColumnWidth) => ({index}: { index: number }) => {
			return fixedColumnWidths.current.mapping[index] ?? getColumnWidth({index})
		}

		//Stores the amount of columns that we want to calculate using the remaining width of the grid
		const calculatingColumnCount = useMemo(() => {
			return columnCount - mainHeaders.filter(e => e.width).length
		}, [columnCount, mainHeaders])

	  /** @todo Review nested headers width, its still an issue and also NaN's at widths
	   * **/
	  const renderGridsWrapper = (width: number) => {
		  return (
			<>
				<ColumnSizer
				  columnMinWidth={minColumnWidth}
				  columnCount={calculatingColumnCount}
				  width={buildColumnTotalWidth(width)}
				>
					{({adjustedWidth, columnWidth, registerChild, getColumnWidth}) => (
					  <ScrollHandler
						scrollContainer={gridContainerRef.current}
						width={width - CONTAINER_SCROLL_WIDTH}
						data={props.data}
						//TODO Review to use the dynamic width and also review NaN
						totalColumnWidth={columnWidth * columnCount}
						stretchMode={props.stretchMode}
						ref={componentRef}
					  >
						  {({
							    scrollTop,
							    scrollLeft,
							    isScrolling,
							    gridRef,
							    headerRef,
							    onScroll,
							    height,
						    }) => (
							<>
								<ColumnGrid
								  headers={props.headers}
								  className={classes.headerContainer}
								  width={adjustedWidth + fixedColumnWidths.current.totalSize}
								  defaultColumnWidth={minColumnWidth}
								  getColumnWidth={getColumnWidthHelper(getColumnWidth)}
								  ref={headerRef}
								  minRowHeight={props.minColumnHeight ?? 50}
								  scrollLeft={scrollLeft}
								  isScrolling={isScrolling}
								  onScroll={onScroll}
								  height={height}
								  theme={props.theme}
								  coords={coords}
								  stretchMode={props.stretchMode}
								/>
								<GridWrapper
								  rows={rows}
								  className={classes.bodyContainer}
								  scrollTop={scrollTop}
								  registerChild={registerChild}
								  defaultColumnWidth={minColumnWidth}
								  width={adjustedWidth + fixedColumnWidths.current.totalSize}
								  getColumnWidth={getColumnWidthHelper(getColumnWidth)}
								  minRowHeight={props.minRowHeight ?? 50}
								  ref={gridRef}
								  scrollLeft={scrollLeft}
								  isScrolling={isScrolling}
								  onScroll={onScroll}
								  height={height}
								  columnCount={columnCount}
								  coords={coords}
								  selectCell={selectCell}
								  onCellClick={onCellClick}
								  /** Public API **/
								  headers={props.headers}
								  onGridReady={props.onGridReady}
								  defaultCoords={props.defaultCoords}
								  suppressNavigation={props.suppressNavigation}
								  outsideClickDeselects={props.outsideClickDeselects}
								  gridContainerRef={gridContainerRef.current}
								  onCellChange={props.onCellChange}
								  theme={props.theme}
								/>
							</>
						  )}
					  </ScrollHandler>
					)}
				</ColumnSizer>
			</>
		  )
	  }

	  return (
		<div id="grid-container" className={classes.root} ref={gridContainerRef}>
			<AutoSizer disableHeight>
				{({width}) => renderGridsWrapper(width)}
			</AutoSizer>
		</div>
	  );
  }
);

export default ApolloSpreadSheet;
