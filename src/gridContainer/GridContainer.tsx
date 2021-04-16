import React, { useCallback, useRef } from 'react'
import { StretchMode } from '../types'
import { AutoSizer, ScrollSync, Size } from 'react-virtualized'
import { createColumnWidthsMapping, ColumnWidthRecord } from '../columnGrid'
import { useLogger } from '../logger'
import { GRID_RESIZE } from '../api'
import { GridContainerProps } from './GridContainerProps'
import scrollbarSizeCalc from 'dom-helpers/scrollbarSize'
import { Box } from '@material-ui/core'

const DEFAULT_SCROLLBAR_SIZE = 14

export const GridContainer: React.FC<GridContainerProps> = React.memo(
  ({
    minColumnWidth,
    stretchMode,
    apiRef,
    columns,
    children,
    width,
    height,
    containerClassName,
  }) => {
    const logger = useLogger('GridContainer')
    const calculatedScrollbarSize = scrollbarSizeCalc(true)
    //Added a default scrollbar size to avoid 0 spacing and overlaps of the scrollbar to the grid
    const scrollbarSize =
      calculatedScrollbarSize > 0 ? calculatedScrollbarSize : DEFAULT_SCROLLBAR_SIZE
    const columnWidths = useRef<ColumnWidthRecord>({
      totalSize: 0,
      mapping: {},
    })

    /**
     * Helper that facades with getColumnWidth function provided by react-virtualize and either returns
     * the fixed width from our mapping or fetches directly from react-virtualize
     * @param getColumnWidth
     */
    const getColumnWidthHelper = useCallback(
      ({ index }: { index: number }) => {
        const value = columnWidths.current.mapping[index]
        return isNaN(value) ? minColumnWidth : value
      },
      [minColumnWidth],
    )

    const calculateColumnWidths = (containerWidth: number) => {
      const { mapping, totalSize } = createColumnWidthsMapping(
        columns,
        containerWidth,
        minColumnWidth,
        stretchMode,
      )

      //Just update with the new calculated (if it was otherwise it might have been a cached result)
      columnWidths.current = {
        totalSize,
        mapping,
      }
    }

    const onResize = useCallback(
      (info: Size) => {
        if (!apiRef.current.isInitialised) {
          return
        }
        apiRef.current.dispatchEvent(GRID_RESIZE, info)
      },
      [apiRef],
    )

    function render(containerWidth: number, containerHeight = 500) {
      const normalizedContainerWidth =
        stretchMode !== StretchMode.None ? containerWidth - scrollbarSize : containerWidth

      //Invoke our column builder
      calculateColumnWidths(normalizedContainerWidth)

      logger.debug({
        containerWidth,
        containerHeight,
        scrollbarSize,
        stretchMode,
        normalizedContainerWidth,
        columnWidths: columnWidths.current,
        hasHorizontalScroll: stretchMode === StretchMode.None,
      })

      if (stretchMode !== StretchMode.None) {
        return (
          <>
            {children({
              width: containerWidth,
              height: containerHeight,
              getColumnWidth: getColumnWidthHelper,
              scrollLeft: 0,
            })}
          </>
        )
      }

      return (
        <ScrollSync>
          {({ onScroll, scrollLeft }) => (
            <>
              {children({
                width: containerWidth,
                height: containerHeight,
                getColumnWidth: getColumnWidthHelper,
                scrollLeft,
                onScroll,
              })}
            </>
          )}
        </ScrollSync>
      )
    }

    //In case of specified width and height, allow the control to the developer
    if (height && width) {
      return (
        <Box
          height={height}
          width={width}
          id="grid-container"
          className={containerClassName}
          position={'relative'}
        >
          {render(Number(width), Number(height))}
        </Box>
      )
    }

    return (
      <Box height={'100%'} width={'100%'} id="grid-container" className={containerClassName}>
        <AutoSizer
          disableWidth={width !== undefined}
          disableHeight={height !== undefined}
          defaultHeight={Number(height)}
          defaultWidth={Number(width)}
          onResize={onResize}
        >
          {({ width, height }) => render(width, height)}
        </AutoSizer>
      </Box>
    )
  },
)
