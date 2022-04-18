import React, { useRef, useEffect, useMemo, useCallback, CSSProperties } from 'react'
import { CellMeasurerCache, CellMeasurerCacheParams, Grid } from 'react-virtualized'
import CellMeasurer from '../cellMeasurer/CellMeasureWrapper'
import { GridHeader } from './types'
import clsx from 'clsx'
import { ColumnGridProps } from './columnGridProps'
import { CellMeasureRendererProps, MeasurerRendererProps } from '../cellMeasurer'
import Tooltip from '@mui/material/Tooltip'
import { ROW_SELECTION_HEADER_ID } from '../rowSelection'
import { makeStyles } from '@mui/styles'
import { isFunctionType } from '../helpers'
import flattenDeep from 'lodash/flattenDeep'
import { createCellQueryProperties } from '../keyboard'
import { useLogger } from '../logger'
import { SortIndicator } from './components'
import { useApiEventHandler } from '../api'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

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
}))

export const ColumnGrid: React.FC<ColumnGridProps> = React.memo(
  ({
    minColumnWidth,
    minRowHeight,
    width,
    getColumnWidth,
    apiRef,
    theme,
    coords,
    onScrollHeader,
    columns,
    nestedColumnsProps,
    nestedHeaders,
    nestedRowsEnabled,
    data,
    overscanColumnCount,
    overscanRowCount,
    scrollLeft,
    disableSort,
    sort,
    headerId,
  }) => {
    const classes = useStyles()
    const logger = useLogger('ColumnGrid')
    const cache: CellMeasurerCache = useMemo(() => {
      /**
       * @todo We might provide the same layer with fixed  as we did for gridWrapper
       */
      const options: CellMeasurerCacheParams = {
        defaultWidth: minColumnWidth,
        defaultHeight: minRowHeight,
        //Width and height are fixed
        //Width is calculated on useHeaders hook
        //Height is never going to expand to avoid conflicts
        fixedWidth: true,
        fixedHeight: true,
        minHeight: minRowHeight,
        minWidth: minColumnWidth,
        /**
         * @todo We might need to review if this impacts any performance overall but i think this could be a boost
         * since we have fixed sizes therefore the calculation afterwards will likely be the same
         */
        keyMapper: () => 1,
      }

      return new CellMeasurerCache(options)
    }, [minColumnWidth, minRowHeight])

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
      const flattenData = flattenDeep(data)
      return flattenData.reduce((mapping, cell) => {
        const updatedMap = { ...mapping }
        if (typeof disableSort === 'boolean' && disableSort) {
          updatedMap[cell.id] = true
        } else if (cell.isNested || cell.id === ROW_SELECTION_HEADER_ID || cell.dummy) {
          updatedMap[cell.id] = true
        } else if (isFunctionType(disableSort)) {
          updatedMap[cell.id] = disableSort(cell)
        } else {
          updatedMap[cell.id] = false
        }
        return updatedMap
      }, {} as Record<string, SortDisabled>)
    }, [data, disableSort])

    // clear cache and recompute when data changes OR when the container width changes
    const recomputeSizes = useCallback(() => {
      loggerRef.current.debug('Recomputing Sizes')
      cacheRef.current?.clearAll()
      gridRef.current?.recomputeGridSize()
    }, [])

    useApiEventHandler(apiRef, 'DATA_CHANGED', recomputeSizes)
    useApiEventHandler(apiRef, 'GRID_RESIZE', recomputeSizes)
    useApiEventHandler(apiRef, 'COLUMNS_CHANGED', recomputeSizes)

    const headerRendererWrapper = useCallback(
      ({ style, cell, ref, columnIndex, rowIndex }: CellMeasureRendererProps<GridHeader>) => {
        const { title, renderer } = cell
        const column = columns[columnIndex]
        //in case its not found, we set to true
        const isSortDisabled = nestedRowsEnabled ? true : headersSortDisabledMap[cell.id]
        const sortComponent =
          isSortDisabled || cell.accessor !== sort?.accessor ? null : (
            <span>{<SortIndicator order={sort?.order} />}</span>
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
            apiRef,
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

        const wrapperStyles: CSSProperties = {
          ...style,
          zIndex: isSpannerAndNested ? 999 : defaultZIndex,
        }

        const wrapper = child => {
          //Add navigationProps in case its a normal cell navigable
          const navigationProps = cell.dummy
            ? {}
            : createCellQueryProperties({
                role: 'columnheader',
                colIndex: columnIndex,
                rowIndex,
              })

          return (
            <div ref={ref} {...navigationProps} className={headerClassName} style={wrapperStyles}>
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
              <span
                onClick={isSortDisabled ? undefined : () => apiRef.current.toggleSort(cell.id)}
                className={classes.contentSpan}
              >
                {child}
                {sortComponent}
              </span>
            </div>
          )
        }

        // support nested column
        if (nestedColumnsProps?.nestedColumns) {
          const id = String(column[apiRef.current.selectionKey])
          const depth = apiRef.current.getColumnDepth(id)
          const nestedMargin = (nestedColumnsProps?.nestedColumnMargin ?? 10) * depth
          //Parent collapse renders an additional layer with collapse controls
          if (column.__children && rowIndex === 0) {
            const iconStyle: React.CSSProperties = {
              cursor: 'pointer',
              right: 0,
              position: 'absolute',
            }
            const isColumnExpanded = apiRef.current.isColumnExpanded(id)

            const handleCollapseClick = () => {
              if (!id) {
                return logger.error(
                  `Column index ${columnIndex} does not have a key in order to toggle collapse!`,
                )
              }

              //Select the target column if not selected
              if (coords.rowIndex !== columnIndex) {
                apiRef.current.selectCell({ ...coords, colIndex: columnIndex })
              }
              apiRef.current.toggleColumnExpand(id)
            }

            const renderExpandOrCollapseIcon = () => {
              if (nestedColumnsProps?.iconRenderer) {
                return nestedColumnsProps?.iconRenderer(handleCollapseClick, isColumnExpanded)
              }

              return isColumnExpanded ? (
                <KeyboardArrowRightIcon
                  onClick={handleCollapseClick}
                  fontSize={'small'}
                  style={iconStyle}
                />
              ) : (
                <KeyboardArrowDownIcon
                  onClick={handleCollapseClick}
                  fontSize={'small'}
                  style={iconStyle}
                />
              )
            }

            const component = (
              <div style={depth > 1 ? { marginLeft: nestedMargin } : {}}>
                {children}
                {renderExpandOrCollapseIcon()}
              </div>
            )
            return wrapper(component)
          }

          //Nested columns need to be wrapped on the first cell with a marginLeft
          if (depth > 1 && rowIndex === 0) {
            const component = <div style={{ marginLeft: nestedMargin }}>{children}</div>
            return wrapper(component)
          }
        }
        return wrapper(children)
      },
      [
        apiRef,
        classes.contentSpan,
        classes.defaultHeader,
        columns,
        coords,
        headersSortDisabledMap,
        logger,
        nestedColumnsProps,
        nestedRowsEnabled,
        sort?.accessor,
        sort?.order,
        theme?.currentColumnClass,
        theme?.headerClass,
        theme?.nestedHeaderClass,
      ],
    )

    const cellMeasurerWrapperRenderer = useCallback(
      args => {
        /** @todo Review the typings **/
        const cell = data[args.rowIndex]?.[args.columnIndex] as any
        if (!cell) {
          return null
        }

        const style: CSSProperties = {
          ...args.style,
          //TODO Review this style property
          ...cell.style,
          width: getColumnWidth({ index: args.columnIndex }),
          userSelect: 'none',
        }

        const rendererProps: MeasurerRendererProps = {
          ...args,
          cell,
          getColumnWidth,
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
      [cache, data, getColumnWidth, headerRendererWrapper],
    )

    const rowCount = useMemo(() => {
      return nestedHeaders ? nestedHeaders.length + 1 : 1
    }, [nestedHeaders])

    const onRefMount = useCallback(instance => {
      gridRef.current = instance
    }, [])

    return (
      <>
        <Grid
          className={clsx(classes.headerContainer)}
          id={headerId}
          ref={onRefMount}
          cellRenderer={cellMeasurerWrapperRenderer}
          deferredMeasurementCache={cache}
          rowHeight={cache.rowHeight}
          rowCount={rowCount}
          columnCount={columns.length}
          overscanRowCount={overscanRowCount ?? 2}
          overscanColumnCount={overscanColumnCount ?? 2}
          width={width}
          columnWidth={getColumnWidth}
          height={100} //Its going to be ignored due to autoHeight
          autoHeight
          onScroll={onScrollHeader}
          tabIndex={-1}
        />
      </>
    )
  },
)

export default ColumnGrid
