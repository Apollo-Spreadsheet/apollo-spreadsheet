/* eslint-disable react/prop-types */
import React from "react";
import { Cell } from "../types/row.interface";
/** @todo Move this file and rename into the core */


const generateDummy = ({ parent, index, totalDummies, dummyFor }) => {
  const style: any = {};
  const first = index === 0;
  const last = index === totalDummies - 1;

  /** @todo Review this part, we might only provide a className with theme to indicate whether its the last
   * column or last row or even for spanns, the user might want to do something about it **/
  if (dummyFor === "colSpan") {
    style.borderLeft = 0;
    if (!last) {
      style.borderRight = 0;
    }
  } else {
    style.borderTop = 0;
    if (!last) {
      style.borderBottom = 0;
    }
  }

  return {
    ...parent,
    colSpan: 1,
    rowSpan: 1,
    children: "",
    dummy: true,
    dummyFor,
    first,
    last,
    style: {
      ...parent.style,
      ...style,
    },
    parentRow: parent /** @todo We might only need the id in the future or the index */,
  };
};

/**@todo Re create this without being an object and also move into a different file this kind of process
 *  **/
const dummyBuffer = {
  init() {
    // @ts-ignore
    this.buffer = new Map();
  },
  dispose() {
    // @ts-ignore
    this.buffer = null
  },
  extract(index) {
    // @ts-ignore
    const { buffer } = this;
    const arr: any[] = [];

    if (!buffer.has(index) || buffer.get(index).length === 0) {
      return arr;
    }

    buffer.get(index).forEach((item) => {
      if (!item.remainingRows) {
        return;
      }

      arr.push(
        generateDummy({
          parent: item.parent,
          totalDummies: item.parent.rowSpan - 1,
          index: item.parent.rowSpan - 1 - item.remainingRows,
          dummyFor: "rowSpan",
        })
      );

      // eslint-disable-next-line no-param-reassign
      item.remainingRows -= 1;
    });

    return arr;
  },
  insert(key, arr) {
    // @ts-ignore
    if (this.buffer.has(key)) {
      // @ts-ignore
      this.buffer.get(key).push(...arr);
    } else {
      // @ts-ignore
      this.buffer.set(key, arr);
    }
  },
};

/**
 * Requires a re-write due to flatMap, unknown types and the data not being passed
 * with interface and as row(with cells)
 * @param data
 */
export function insertDummyCells(data: any[] = []) {
  dummyBuffer.init();

  const transformedData = data.map((row: any) => {
    let lastRowSpanI = -1;
    let finalCellIndex = 0;

    const cells = row.flatMap((col, colIndex) => {
      const arr: any[] = [];

      // consume from buffer
      arr.push(...dummyBuffer.extract(finalCellIndex));

      // add dummy cell data to buffer for future rows to extract
      if (col.rowSpan > 1) {
        const parentData = {
          remainingRows: col.rowSpan - 1,
          parent: col,
        };

        let bufferKey = finalCellIndex;
        if (lastRowSpanI !== -1 && row[colIndex - 1].rowSpan > 1) {
          bufferKey = lastRowSpanI;
        } else {
          lastRowSpanI = finalCellIndex;
        }

        const dummiesToPush = col.colSpan || 1;
        const dummiesArray: any[] = [];

        for (let i = 0; i < dummiesToPush; i += 1) {
          dummiesArray.push({ ...parentData });
        }

        dummyBuffer.insert(bufferKey, dummiesArray);
      }

      arr.push({
        ...col,
      });

      if (col.colSpan > 1) {
        const totalDummies = col.colSpan - 1;
        const dummies = [...Array(totalDummies).keys()].map((_, index) =>
          generateDummy({
            parent: col,
            index,
            totalDummies,
            dummyFor: "colSpan",
          })
        );

        arr.push(...dummies);
      }

      finalCellIndex += arr.length;

      return arr;
    });

    // buffer has data for next cell
    cells.push(...dummyBuffer.extract(finalCellIndex));

    return cells;
  });

  //Release the used memory of the map
  dummyBuffer.dispose()

  return transformedData
}
