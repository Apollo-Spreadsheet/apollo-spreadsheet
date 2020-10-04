import React, { useMemo, useEffect, useRef } from "react"
import { CellMeasurer, CellMeasurerCache } from "react-virtualized"

const generateArr = (n) => [...Array(n).keys()]

const getMaxSum = (generator, x) =>
  generateArr(x).reduce((sum, i) => sum + generator(i), 0)

interface Props {
  rowSpan?: number;
  colSpan?: number;
  parent: any;
  rowIndex: number;
  columnIndex: number;
  cache: CellMeasurerCache;
  children?: any;
  cellRenderer: Function;
  rendererProps: any;
  style?: React.CSSProperties;
}

const CellMeasureWrapper = React.memo(
  ({
    rowSpan,
    colSpan,
    children,
    cellRenderer,
    rendererProps,
    style,
    ...props
  }: Props) => {
    const initializeStyles = () => {
      const defaultStyle = {
        transform: "translate3d(0, 0, 0)",
        alignItems: "center",
        overflow: "hidden",
        wordBreak: "break-word",
        textOverflow: "ellipsis",
        textAlign: "center",
      }

      //Ensure it is 1 by default in case we have none
      if (!rowSpan) {
        rowSpan = 1
      }
      if (!colSpan) {
        colSpan = 1
      }

      const {
        rowIndex,
        cache,
      } = props

      if (rowSpan === 1 && colSpan === 1) {
        return style ? { ...style, ...defaultStyle } : defaultStyle
      }

      const rowGenerator = (row) => cache.rowHeight({ index: rowIndex + row })
      //Retrieve dynamically to calculate colSpan if needed
      const columnWidth = rendererProps.getColumnWidth({ index: props.columnIndex })

      const rowSpanStyle =
        rowSpan === 1
          ? {}
          : {
              height: getMaxSum(rowGenerator, rowSpan),
            }
      const colSpanStyle =
        colSpan === 1
          ? {}
          : {
              width: columnWidth * colSpan,
            }

      const _style = {
        ...style,
        ...defaultStyle,
        ...rowSpanStyle,
        ...colSpanStyle,
        zIndex: 1,
      }

      return _style
    }

    const spanningStyle = initializeStyles()
    return (
      <CellMeasurer {...props}>
        {({ registerChild }) =>
          cellRenderer({
            ...rendererProps,
            style: spanningStyle,
            ref: registerChild,
          })
        }
      </CellMeasurer>
    )
  }
)

export default CellMeasureWrapper
