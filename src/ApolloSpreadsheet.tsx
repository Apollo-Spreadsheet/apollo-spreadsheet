import React, { forwardRef, useCallback, useEffect, useRef, useState, CSSProperties } from 'react'
import GridWrapper from './gridWrapper/GridWrapper'
import ColumnGrid from './columnGrid/ColumnGrid'
import { useKeyboard } from './keyboard'
import { StretchMode } from './types'
import { useMergeCells } from './mergeCells'
import { useHeaders } from './columnGrid'
import { useData } from './data'
import { useRowSelection } from './rowSelection'
import { Box, ClickAwayListener, useForkRef } from '@material-ui/core'
import { useEditorManager } from './editorManager'
import { createPortal } from 'react-dom'
import { GridContainer } from './gridContainer'
import {
  useApiRef,
  useApiFactory,
  useApiEventHandler,
  CELL_CLICK,
  CELL_DOUBLE_CLICK,
  useApiExtends,
  GridApi,
} from './api'
import { useEvents } from './events/useEvents'
import { ApolloSpreadsheetProps } from './ApolloSpreadsheetProps'
import { useSort } from './sort/useSort'
import { useLogger } from './logger'
import { isFunctionType } from './helpers'
import { NestedRowsProps, useNestedRows } from './nestedRows'
import { useTheme } from './theme'
import { NestedColumnsProps } from './nestedColumns/nestedColumnsProps'
import { useNestedColumns } from './nestedColumns/useNestedColumns'
import { OnScrollParams } from 'react-virtualized'

/**
 * @todo I need to ensure this is only loaded in development, seems that with
 * process.env.NODE_ENV its not working when shipped and in Next.js applications
 * it throws a Loadable component error
 */
/*
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, {
    trackAllPureComponents: false,
    trackHooks: true,
  })
}
*/

const rootDivStyle: CSSProperties = { height: '100%', width: '100%' }

export const ApolloSpreadSheet: React.FC<ApolloSpreadsheetProps> = forwardRef(
  (props, componentRef: React.Ref<HTMLDivElement>) => {
    const logger = useLogger('ApolloSpreadSheet')
    const minColumnWidth = props.minColumnWidth ?? 30
    const [gridFocused, setGridFocused] = useState(true)
    const defaultApiRef = useApiRef()
    const apiRef = React.useMemo(
      () => (!props.apiRef ? defaultApiRef : props.apiRef),
      [props.apiRef, defaultApiRef],
    )
    const rootContainerRef = useRef<HTMLDivElement>(null)
    const forkedRef = useForkRef(rootContainerRef, componentRef)
    const initialised = useApiFactory(rootContainerRef, apiRef, props.selection?.key)
    const nestedRowsEnabled = props.nestedRows ?? false
    const nestedColumnsEnabled = props.nestedColumns ?? false
    useEvents(rootContainerRef, apiRef)
    const theme = useTheme({ apiRef, options: props.theme })

    const { gridHeaders, columns } = useHeaders({
      columns: props.columns,
      nestedHeaders: props.nestedHeaders,
      minColumnWidth,
      apiRef,
      initialised,
      selection: props.selection,
      nestedColumnsEnabled,
    })

    const { mergedPositions, mergedCells, isMerged } = useMergeCells({
      mergeCells: props.mergeCells ?? [],
      rowCount: props.rows.length,
      columnCount: columns.length,
      apiRef,
      initialised,
    })

    const { cells, rows } = useData({
      rows: props.rows,
      selection: props.selection,
      apiRef,
      initialised,
      nestedRowsEnabled,
    })

    useNestedRows({
      apiRef,
      initialised,
      enabled: nestedRowsEnabled,
      defaultExpandedIds: props.defaultExpandedIds,
    })

    useNestedColumns({
      apiRef,
      initialised,
      enabled: nestedColumnsEnabled,
      defaultExpandedColumnsIds: props.defaultExpandedColumnsIds,
    })

    const sort = useSort(apiRef)

    const coords = useKeyboard({
      defaultCoords: props.defaultCoords ?? {
        rowIndex: 0,
        colIndex: 0,
      },
      suppressControls: props.suppressNavigation || !gridFocused,
      onCellChange: props.onCellChange,
      onCreateRow: props.onCreateRow,
      apiRef,
      initialised,
    })

    useRowSelection(apiRef, initialised, props.selection)

    const editorNode = useEditorManager({
      onCellChange: props.onCellChange,
      apiRef,
      initialised,
    })

    //Ensure the root container is focused
    useEffect(() => {
      rootContainerRef.current?.focus()
    }, [])

    const focus = useCallback(() => {
      logger.debug('focusing the grid with default coordinates ')
      if (!rootContainerRef.current) {
        logger.warn('Root container reference not defined yet')
      }
      rootContainerRef.current?.focus()
      setGridFocused(true)
      apiRef.current.selectCell(props.defaultCoords ?? { colIndex: 0, rowIndex: 0 })
    }, [apiRef, logger, props.defaultCoords])

    const clearFocus = useCallback(() => {
      if (gridFocused) {
        logger.debug('clearing the grid focus and selecting negative coordinates')
        setGridFocused(false)
        rootContainerRef.current?.blur()
        apiRef.current.selectCell({
          rowIndex: -1,
          colIndex: -1,
        })
      }
    }, [apiRef, gridFocused, logger])

    const onClickAway = useCallback(
      (event: React.MouseEvent<Document, MouseEvent>) => {
        if (!gridFocused) {
          return
        }

        //Handle callback style
        if (isFunctionType(props.outsideClickDeselects)) {
          const shouldClearFocus = props.outsideClickDeselects(event.target as HTMLElement)
          if (shouldClearFocus) {
            logger.debug(
              `Grid click away detected. Callback returned false on target element id: ${
                (event.target as HTMLElement).id
              }`,
            )
            return clearFocus()
          }
        } else if (props.outsideClickDeselects) {
          logger.debug('Grid outsideClickDeselects is passed as `true` value')
          clearFocus()
        }
      },
      [gridFocused, props, logger, clearFocus],
    )

    // Detect if any element is clicked again to enable focus
    const onCellMouseHandler = useCallback(() => {
      if (!gridFocused) {
        logger.debug('Grid focus restored.')
        setGridFocused(true)
      }
    }, [gridFocused, logger])

    // Clear every listener when component unmounts/apiRef changes
    useEffect(() => {
      const api = apiRef.current
      return () => {
        api.removeAllListeners()
      }
    }, [apiRef])

    useApiEventHandler(apiRef, CELL_CLICK, onCellMouseHandler)
    useApiEventHandler(apiRef, CELL_DOUBLE_CLICK, onCellMouseHandler)
    const rootApiMethods: Partial<GridApi> = { clearFocus, focus, isFocused: gridFocused }
    useApiExtends(apiRef, rootApiMethods, 'CoreApi')
    const nestedRowsProps: NestedRowsProps = {
      nestedRows: nestedRowsEnabled,
      nestedRowMargin: props.nestedRowMargin,
      defaultExpandedIds: props.defaultExpandedIds,
      iconRenderer: props.iconRenderer,
    }
    const nestedColumnsProps: NestedColumnsProps = {
      nestedColumns: nestedColumnsEnabled,
      nestedColumnMargin: props.nestedColumnMargin,
      defaultExpandedColumnsIds: props.defaultExpandedColumnsIds,
      iconRenderer: props.iconRenderer,
    }

    const onScrollTable = useCallback(
      (e: OnScrollParams) => {
        if (props?.id) {
          const header = document.getElementById(`header-${props?.id}`) as HTMLElement
          if (!header) {
            return console.warn('The element does not exist on page')
          }
          header.scrollTo(e.scrollLeft, header.scrollTop)
        }

        if (props?.connectToIds && props?.connectToIds?.length > 0) {
          props.connectToIds.map((element: string) => {
            const elementCore = document.getElementById(`core-${element}`) as HTMLElement
            if (!elementCore) {
              return console.warn('The element does not exist on page')
            }
            elementCore.scrollTo(elementCore.scrollLeft, e.scrollTop)
            return elementCore
          })
        }
      },
      [props.connectToIds, props?.id],
    )
    const onScrollHeader = useCallback(
      (e: OnScrollParams) => {
        if (props?.id) {
          const elementCore = document.getElementById(`core-${props?.id}`) as HTMLElement
          if (!elementCore) {
            return console.warn('The element does not exist on page')
          }
          elementCore.scrollTo(e.scrollLeft, elementCore.scrollTop)
        }
      },
      [props?.id],
    )

    return (
      <ClickAwayListener onClickAway={onClickAway}>
        <div style={rootDivStyle} id="root-apollo" ref={forkedRef}>
          <GridContainer
            columns={columns}
            minColumnWidth={minColumnWidth}
            stretchMode={props.stretchMode ?? StretchMode.All}
            containerClassName={props.containerClassName}
            apiRef={apiRef}
            height={props.height}
            width={props.width}
          >
            {({ scrollLeft, onScroll, getColumnWidth, width, height }) =>
              initialised && (
                <Box height={height} width={width} id="apollo-grids" className={props.className}>
                  <ColumnGrid
                    {...props}
                    data={gridHeaders}
                    coords={coords}
                    columns={columns}
                    width={width}
                    minColumnWidth={minColumnWidth}
                    getColumnWidth={getColumnWidth}
                    minRowHeight={props.minColumnHeight ?? 50}
                    scrollLeft={scrollLeft}
                    onScrollHeader={props?.id ? onScrollHeader : () => null}
                    apiRef={apiRef}
                    sort={sort}
                    nestedRowsEnabled={nestedRowsEnabled}
                    nestedColumnsProps={nestedColumnsProps}
                    theme={theme}
                    headerId={`header-${props?.id}`}
                  />
                  <GridWrapper
                    {...props}
                    rows={rows}
                    data={cells}
                    coords={coords}
                    minColumnWidth={minColumnWidth}
                    width={width}
                    getColumnWidth={getColumnWidth}
                    minRowHeight={props.minRowHeight ?? 50}
                    scrollLeft={scrollLeft}
                    onScroll={props?.id ? onScrollTable : () => null}
                    height={height}
                    columnCount={columns.length}
                    columns={columns}
                    stretchMode={props.stretchMode ?? StretchMode.All}
                    apiRef={apiRef}
                    mergeCells={mergedCells}
                    mergedPositions={mergedPositions}
                    isMerged={isMerged}
                    nestedRowsProps={nestedRowsProps}
                    theme={theme}
                    coreId={`core-${props?.id}`}
                  />
                </Box>
              )
            }
          </GridContainer>
          {editorNode && createPortal(editorNode, document.body)}
        </div>
      </ClickAwayListener>
    )
  },
)
// @ts-ignore
//ApolloSpreadSheet.whyDidYouRender = true

export default ApolloSpreadSheet
