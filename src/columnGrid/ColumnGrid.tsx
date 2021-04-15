import React, { useRef, useEffect, useMemo, useCallback, CSSProperties } from 'react'
import { Grid, CellMeasurerCache, CellMeasurerCacheParams } from 'react-virtualized'
import CellMeasurer from '../cellMeasurer/CellMeasureWrapper'
import { GridHeader } from './types'
import clsx from 'clsx'
import { ColumnGridProps } from './columnGridProps'
import { CellMeasureRendererProps, MeasurerRendererProps } from '../cellMeasurer'
import Tooltip from '@material-ui/core/Tooltip'
import { ROW_SELECTION_HEADER_ID } from '../rowSelection'
import { makeStyles } from '@material-ui/core/styles'
import { isFunctionType } from '../helpers'
import flattenDeep from 'lodash/flattenDeep'
import { createCellQueryProperties } from '../keyboard'
import { useLogger } from '../logger'
import { SortIndicator } from './components'
import { GridCell } from '../gridWrapper'

type SortDisabled = boolean
const useStyles = makeStyles(() => ({
  defaultHeader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
    background: '#efefef',
    cursor: 'default',
    border: '1px solid #ccc',
  },
  headerContainer: {
    outline: 'none',
    position: 'sticky !important' as any,
    top: 0,
    zIndex: 1,
    // overflow: 'hidden',
    'scrollbar-width': 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  contentSpan: {
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  sort: {},
  disableScroll: {
    overflow: 'hidden',
  },
}))
export const ColumnGrid: React.FC<ColumnGridProps> = React.memo(props => {
  const classes = useStyles()
  const logger = useLogger('ColumnGrid')
  const cache: CellMeasurerCache = useMemo(() => {
    /**
     * @todo We might provide the same layer with fixed  as we did for gridWrapper
     */
    const options: CellMeasurerCacheParams = {
      defaultWidth: props.minColumnWidth,
      defaultHeight: props.minRowHeight,
      //Width and height are fixed
      //Width is calculated on useHeaders hook
      //Height is never going to expand to avoid conflicts
      fixedWidth: true,
      fixedHeight: true,
      minHeight: props.minRowHeight,
      minWidth: props.minColumnWidth,
      /**
       * @todo We might need to review if this impacts any performance overall but i think this could be a boost
       * since we have fixed sizes therefore the calculation afterwards will likely be the same
       */
      keyMapper: () => 1,
    }

    return new CellMeasurerCache(options)
  }, [props.minColumnWidth, props.minRowHeight])

  const gridRef = useRef<Grid | null>(null)
  const cacheRef = useRef<CellMeasurerCache>(cache)
  const loggerRef = useRef(logger)

  useEffect(() => {
    loggerRef.current = logger
  }, [logger])

  useEffect(() => {
    cacheRef.current = cache
  }, [cache])

  //Stores the headers sort configuration (whether they have sort disabled or not)
  const headersSortDisabledMap = useMemo(() => {
    const flattenData = flattenDeep(props.data)
    return flattenData.reduce((mapping, cell) => {
      const updatedMap = { ...mapping }
      if (typeof props.disableSort === 'boolean' && props.disableSort) {
        updatedMap[cell.id] = true
      } else if (cell.isNested || cell.id === ROW_SELECTION_HEADER_ID || cell.dummy) {
        updatedMap[cell.id] = true
      } else if (isFunctionType(props.disableSort)) {
        updatedMap[cell.id] = props.disableSort(cell)
      } else {
        updatedMap[cell.id] = false
      }
      return updatedMap
    }, {} as Record<string, SortDisabled>)
  }, [props])

  // clear cache and recompute when data changes OR when the container width changes
  const recomputeSizes = useCallback(() => {
    loggerRef.current.debug('Recomputing Sizes')
    cacheRef.current?.clearAll()
    gridRef.current?.recomputeGridSize()
  }, [])

  // clear cache and recompute when data changes
  useEffect(() => {
    recomputeSizes()
  }, [props.data, props.width, recomputeSizes])

  const headerRendererWrapper = useCallback(
    ({ style, cell, ref, columnIndex, rowIndex }: CellMeasureRendererProps<GridHeader>) => {
      const { title, renderer } = cell
      const { theme } = props.apiRef.current
      //in case its not found, we set to true
      const isSortDisabled = props.nestedRowsEnabled ? true : headersSortDisabledMap[cell.id]
      const { sort } = props
      const { coords } = props
      const sortComponent =
        isSortDisabled || cell.accessor !== sort?.accessor ? null : (
          <div className={classes.sort}>{<SortIndicator order={sort?.order} />}</div>
        )

      let headerClassName = ''
      if (!cell.dummy && cell.isNested) {
        headerClassName = clsx(
          classes.defaultHeader,
          theme?.headerClass,
          theme?.nestedHeaderClass,
          cell.className,
        )
      }

      if (!cell.dummy && !cell.isNested) {
        headerClassName = clsx(classes.defaultHeader, theme?.headerClass, cell.className)
      }

      //If the cell is selected we set the column as selected too
      if (!cell.dummy && coords.colIndex === columnIndex && !cell.isNested && rowIndex === 0) {
        headerClassName = clsx(headerClassName, theme?.currentColumnClass)
      }

      let children: JSX.Element | React.ReactNode = title
      if (renderer) {
        children = renderer({
          column: cell,
          className: headerClassName,
          columnIndex,
          apiRef: props.apiRef,
        })
      } else if (cell.tooltip) {
        children = (
          <Tooltip title={cell.tooltip} placement={'top'} {...cell.tooltipProps}>
            <span className={headerClassName}>{title}</span>
          </Tooltip>
        )
      }

      const isSpannerAndNested = cell.colSpan && cell.isNested && !cell.dummy
      const defaultZIndex = cell.dummy ? 0 : 1
      const navigationProps = cell.dummy
        ? {}
        : createCellQueryProperties({
            role: 'columnheader',
            colIndex: columnIndex,
            rowIndex,
          })

      const wrapperStyles: CSSProperties = {
        ...style,
        zIndex: isSpannerAndNested ? 999 : defaultZIndex,
      }
      return (
        <div ref={ref} {...navigationProps} className={headerClassName} style={wrapperStyles}>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
          <span
            onClick={isSortDisabled ? undefined : () => props.apiRef.current.toggleSort(cell.id)}
            className={classes.contentSpan}
          >
            {children}
            {sortComponent}
          </span>
        </div>
      )
    },
    [classes.contentSpan, classes.defaultHeader, classes.sort, headersSortDisabledMap, props],
  )

  const cellMeasurerWrapperRenderer = useCallback(
    args => {
      /** @todo Review the typings **/
      const cell = props.data[args.rowIndex]?.[args.columnIndex] as any
      if (!cell) {
        return null
      }

      const style: CSSProperties = {
        ...args.style,
        //TODO Review this style property
        ...cell.style,
        width: props.getColumnWidth({ index: args.columnIndex }),
        userSelect: 'none',
      }

      const rendererProps: MeasurerRendererProps = {
        ...args,
        cell,
        getColumnWidth: props.getColumnWidth,
      }

      return (
        <CellMeasurer
          cache={cache}
          columnIndex={args.columnIndex}
          key={args.key}
          parent={args.parent}
          rowIndex={args.rowIndex}
          //Disable rowSpanning in headers
          rowSpan={0}
          colSpan={cell.colSpan ?? 0}
          cellRenderer={headerRendererWrapper}
          rendererProps={rendererProps}
          style={style}
        />
      )
    },
    [props, cache, headerRendererWrapper],
  )

  const rowCount = useMemo(() => {
    return props.nestedHeaders ? props.nestedHeaders.length + 1 : 1
  }, [props.nestedHeaders])

  const onRefMount = useCallback(instance => {
    gridRef.current = instance
  }, [])

  return (
    <Grid
      {...props}
      className={clsx(classes.headerContainer, classes.disableScroll)}
      // className={classes.headerContainer}
      ref={onRefMount}
      cellRenderer={cellMeasurerWrapperRenderer}
      deferredMeasurementCache={cache}
      rowHeight={cache.rowHeight}
      rowCount={rowCount}
      columnCount={props.columns.length}
      overscanRowCount={props.overscanRowCount ?? 2}
      overscanColumnCount={props.overscanColumnCount ?? 2}
      width={props.width}
      columnWidth={props.getColumnWidth}
      height={100} //Its going to be ignored due to autoHeight
      autoHeight
      scrollLeft={props.scrollLeft}
    />
  )
})

export default ColumnGrid
