import React, { useState, useEffect, useCallback } from "react";
import { isIndexOutOfBoundaries } from "./navigation.utils";
import _ from "lodash";
import { GridCell, GridRow } from "../types/row.interface";
import { ICellClickProps } from "./types/cell-click-props.type";
import { NavigationCoords } from "./types/navigation-coords.type";
import { OnCellClick } from "./types/cell-click-event.type";
import { Column } from "../column/types/header.type";
import { isFunction } from "util";
import { isFunctionType } from "../utils/isFunction";

interface Props {
  defaultCoords: NavigationCoords;
  data: Array<GridRow>;
  gridRootRef: HTMLDivElement | null;
  columnsCount: number;
  rowsCount: number;
  suppressNavigation: boolean;
  getColumnAt: (colIndex: number) => Column;
}
export type SelectCellFn = (params: NavigationCoords) => void
export function useNavigation({
  data,
  gridRootRef,
  columnsCount,
  rowsCount,
  defaultCoords,
  suppressNavigation,
  getColumnAt,
}: Props): [NavigationCoords, SelectCellFn, OnCellClick] {
  const [coords, setCoords] = useState<NavigationCoords>(defaultCoords);
  const isMergedCell = (row: any, colIndex: number) => {
    const cell = row[colIndex];
    if (!cell) {
      console.warn("Cell not found in row ", row, colIndex);
      return false;
    }
    if (cell.rowSpan > 1 || cell.first || cell.parentRow) {
      return true;
    }

    return false;
  };

  const findCellById = (id: string) => {
    let result: {
      cell: GridCell | null;
      rowIndex: number;
      cellIndex: number;
    } = { cell: null, rowIndex: -1, cellIndex: -1 };
    data.map((row, rowIndex) => {
      // console.log(row)
      // const flatten = (row as any).flat()
      row.forEach((cell, cellIndex) => {
        if (cell?.id === id && !cell.dummy) {
          result = { cell, rowIndex, cellIndex };
          return;
        }
      });
    });

    return result;
  };

  const findMergedCellParent = (row: any, colIndex: number) => {
    // console.log("Checking for row");
    // console.log({ row, data, colIndex });

    const targetCell = row[colIndex];
    // console.log({ targetCell });
    if (!targetCell) {
      console.warn("Column does not exist in row -> ", row, colIndex);
      return;
    }
    //If it is the first cell (main parent) we can directly bypass parent lookup
    if (targetCell.first && !targetCell.dummy) {
      const result = findCellById(targetCell.id);
      if (result) {
        return result;
      }
    }

    //Check if we have parent and find its index
    if (targetCell.parentRow) {
      const result = findCellById(targetCell.parentRow.id);
      if (result) {
        return result;
      }
    }

    //Fallback in case it has more than 1 span and also id defined
    if (targetCell.rowSpan > 1 && targetCell.id) {
      const result = findCellById(targetCell.id);
      if (result) {
        return { rowIndex: result.rowIndex, cell: result.cell };
      }
    }
    return null;
  };

  /**
   * Recursively looks for the next navigable cell
   * @param currentIndex
   * @param direction
   */
  const findNextNavigableColumnIndex = (currentIndex: number, direction: 'left' | 'right') => {
    const nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1
    const nextCol = getColumnAt(nextIndex)
    //Fallback the current in case it was not found
    if (!nextCol){
      return currentIndex
    }

    if (nextCol.disableNavigation){
      return findNextNavigableColumnIndex(nextIndex, direction)
    }
    return nextIndex
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (suppressNavigation) {
      return;
    }
    /**
     * @todo Consider non navigate cells and find the next navigable cell (considering merged cell) and also the direction
     * we want to find (if its the next column or previous, next row or previous)
     */
    if (e.key === "ArrowDown") {
      e.preventDefault();
      //Ensure we are not out of boundaries yet
      if (isIndexOutOfBoundaries(coords.rowIndex + 1, 0, rowsCount - 1)) {
        return;
      }

      const cell = data[coords.rowIndex]?.[coords.colIndex];
      //If cell is merged we sum the rowSpan on the current
      if (isMergedCell(data[coords.rowIndex], coords.colIndex)) {
        if (!cell.rowSpan) {
          console.error("Merged cell rowspan not found");
          return;
        }
        const next = coords.rowIndex + cell.rowSpan;
        return selectCell({ rowIndex: next, colIndex: coords.colIndex });
      }

      return selectCell({
        rowIndex: coords.rowIndex + 1,
        colIndex: coords.colIndex,
      });
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      let nextIndex = coords.rowIndex - 1;

      if (nextIndex < 0) {
        return;
      }

      //Check the previous row and if one of them has row span. If so we jump into the first
      const cell = data[nextIndex];
      if (cell) {
        //If its merged we need to jump into its parent otherwise its just the previous index
        if (isMergedCell(data[nextIndex], coords.colIndex)) {
          const res = findMergedCellParent(data[nextIndex], coords.colIndex);
          if (res) {
            return selectCell({
              rowIndex: res.rowIndex,
              colIndex: coords.colIndex,
            });
          }
          return console.error(
            "The result was not defined, please check if row/col exists"
          );
        } else {
          return selectCell({ rowIndex: nextIndex, colIndex: coords.colIndex });
        }
      }
      return selectCell({
        rowIndex: coords.rowIndex - 1,
        colIndex: coords.colIndex,
      });
    }

    if (e.key === "ArrowRight" || e.key === "Tab") {
      e.preventDefault();
      let nextIndex = coords.colIndex + 1;
      if (isIndexOutOfBoundaries(nextIndex, 0, columnsCount - 1)) {
        return;
      }
      //Is navigable?
      const col = getColumnAt(nextIndex)
      if (!col){
        return console.error("Column not found at" + nextIndex)
      }

      if (col.disableNavigation){
        nextIndex = findNextNavigableColumnIndex(coords.colIndex, 'right')
      }

      selectCell({ rowIndex: coords.rowIndex, colIndex: nextIndex });
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      let nextIndex = coords.colIndex - 1;
      if (isIndexOutOfBoundaries(nextIndex, 0, columnsCount - 1)) {
        return;
      }
      const col = getColumnAt(nextIndex)
      if (!col){
        return console.error("Column not found at " + nextIndex)
      }

      if (col.disableNavigation){
        nextIndex = findNextNavigableColumnIndex(coords.colIndex, 'left')
      }

      if (isMergedCell(data[coords.rowIndex], nextIndex)) {
        const res = findMergedCellParent(data[coords.rowIndex], nextIndex);
        if (res) {
          return selectCell({ rowIndex: res.rowIndex, colIndex: nextIndex });
        }
        return console.error(
          "The result was not defined, please check if row/col exists"
        );
      } else {
        return selectCell({ rowIndex: coords.rowIndex, colIndex: nextIndex });
      }
    }
  };

  useEffect(() => {
    gridRootRef?.addEventListener("keydown", onKeyDown);
    return () => gridRootRef?.removeEventListener("keydown", onKeyDown);
  }, [data, coords, gridRootRef, suppressNavigation, rowsCount, columnsCount]);

  const selectCell = useCallback(
    ({ colIndex, rowIndex }: NavigationCoords) => {
      if (suppressNavigation) {
        return console.error("suppressNavigation is enabled");
      }

      //Equal selection comparison
      if (coords.colIndex === colIndex && coords.rowIndex === rowIndex) {
        return;
      }

      //Validate boundaries
      if (
        isIndexOutOfBoundaries(colIndex, 0, columnsCount - 1) ||
        isIndexOutOfBoundaries(rowIndex, 0, rowsCount - 1)
      ) {
        return;
      }

      setCoords({ colIndex, rowIndex });
    },
    [suppressNavigation, coords, rowsCount, columnsCount]
  );

  const isNavigationDisabledAt = (rowIndex: number, colIndex: number) => {
    const column = getColumnAt(colIndex);
    if (!column) {
      console.error("Column not found at " + colIndex);
      return false;
    }

    return isFunctionType(column.disableNavigation)
      ? column.disableNavigation({ rowIndex, colIndex })
      : column.disableNavigation;
  };
  const onCellClick = useCallback(
    ({ rowIndex, colIndex, event }: ICellClickProps) => {
      event.preventDefault();
      if (suppressNavigation) {
        return console.error("No navigation");
      }

      if (isNavigationDisabledAt(rowIndex, colIndex)) {
        return;
      }

      selectCell({ colIndex, rowIndex });
    },
    [suppressNavigation, coords]
  );

  return [coords, selectCell, onCellClick];
}
