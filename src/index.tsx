import React, {
  forwardRef,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";
import PropTypes from "prop-types";

import { AutoSizer, ColumnSizer } from "react-virtualized";
import ScrollHandler from "./core/ScrollHandler";
import GridWrapper, { GridWrapperCommonProps } from "./core/GridWrapper";
import { makeStyles } from "@material-ui/core/styles";
import ColumnGrid from "./column/ColumnGrid";
import { GridTheme } from "./types/grid-theme";
import { useNavigation } from "./navigation/useNavigation";
import { GridRow, GridData } from "./types/row.interface";
import { insertDummyCells } from "./utils/helpers";

const CONTAINER_SCROLL_WIDTH = 5; /** @todo Make it 15 or 10 to be a little bit wider **/
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
  /** @default 120 **/
  minColumnWidth?: number;
  fixedColumnCount: number;
}

export const VirtualizedTable = forwardRef(
  (props: Props, componentRef: any) => {
    const classes = useStyles();
    const columnCount = useMemo(() => {
      return props.data.length ? props.data[0].length : 0;
    }, [props.data]);
    const gridContainerRef = useRef<HTMLDivElement | null>(null);

    const rows: Array<GridRow> = useMemo(() => {
      return insertDummyCells(props.data);
    }, [props.data]);

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
      defaultCoords: props.defaultCoords ?? { rowIndex: 0, colIndex: 0 },
      /** @todo Dont pass the data but a callback so it can read the row/cell from */
      data: rows,
      gridRootRef: gridContainerRef.current,
      columnsCount: columnCount,
      rowsCount: rows.length,
      suppressNavigation: props.suppressNavigation ?? false,
      getColumnAt,
    });

      // useImperativeHandle(componentRef, () => {
      //   return {
      //     getCoords: () => coords,
      //     getTransformedRows: () => rows
      //   }
      // }, [coords])

    return (
      <div id="grid-container" className={classes.root} ref={gridContainerRef}>
        <AutoSizer disableHeight>
          {({ width }) => (
            <>
              <ColumnSizer
                columnMinWidth={props.minColumnWidth ?? 120}
                columnCount={columnCount}
                width={width - CONTAINER_SCROLL_WIDTH}
              >
                {({ adjustedWidth, columnWidth, registerChild }) => (
                  <ScrollHandler
                    scrollContainer={gridContainerRef.current}
                    width={width - CONTAINER_SCROLL_WIDTH}
                    data={props.data}
                    totalColumnWidth={columnWidth * columnCount}
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
                          autoHeight
                          width={adjustedWidth}
                          columnWidth={columnWidth}
                          ref={headerRef}
                          minRowHeight={props.minColumnHeight ?? 50}
                          scrollLeft={scrollLeft}
                          isScrolling={isScrolling}
                          onScroll={onScroll}
                          height={height}
                          theme={props.theme}
                          coords={coords}
                        />
                        <GridWrapper
                          rows={rows}
                          className={classes.bodyContainer}
                          autoHeight
                          scrollTop={scrollTop}
                          registerChild={registerChild}
                          columnWidth={columnWidth}
                          width={adjustedWidth}
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
          )}
        </AutoSizer>
      </div>
    );
  }
);

export default VirtualizedTable;
