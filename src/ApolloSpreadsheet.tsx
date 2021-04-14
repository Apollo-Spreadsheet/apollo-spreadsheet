import React, { forwardRef, useCallback, useRef, useState } from 'react'
import GridWrapper from './gridWrapper/GridWrapper'
import ColumnGrid from './columnGrid/ColumnGrid'
import { useKeyboard } from './keyboard'
import { StretchMode } from './types'
import { useMergeCells } from './mergeCells'
import { useHeaders } from './columnGrid'
import { useData } from './data'
import { useRowSelection } from './rowSelection'
import { ClickAwayListener, useForkRef } from '@material-ui/core'
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
} from './api'

import { makeStyles } from '@material-ui/core/styles'
import { useEvents } from './events/useEvents'

import { ApolloSpreadsheetProps } from './ApolloSpreadsheetProps'
import { useSort } from './sort/useSort'
import { useLogger } from './logger'
import { isFunctionType } from './helpers'

import { useNestedRows } from './nestedRows'

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    width: '100%',
  },
  fixedBottomContainer: {},
}))

export const ApolloSpreadSheet = forwardRef(
  (props: ApolloSpreadsheetProps, componentRef: React.Ref<HTMLDivElement>) => {
    const logger = useLogger('ApolloSpreadSheet')
    const classes = useStyles()
    const minColumnWidth = props.minColumnWidth ?? 30
    const [gridFocused, setGridFocused] = useState(true)
    const defaultApiRef = useApiRef()
    const apiRef = React.useMemo(() => (!props.apiRef ? defaultApiRef : props.apiRef), [
      props.apiRef,
      defaultApiRef,
    ])
    const rootContainerRef = useRef<HTMLDivElement>(null)
    const forkedRef = useForkRef(rootContainerRef, componentRef)
    const initialised = useApiFactory(rootContainerRef, apiRef, props.theme, props.selection?.key)
    const nestedRowsEnabled = props.nestedRows ?? false
    useEvents(rootContainerRef, apiRef)

    const { gridHeaders, columns } = useHeaders({
      columns: props.columns,
      nestedHeaders: props.nestedHeaders,
      minColumnWidth,
      apiRef,
      initialised,
      selection: props.selection,
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
      defaultIds: props.defaultExpandedIds,
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

    const clearFocus = useCallback(() => {
      if (gridFocused) {
        logger.debug('Grid clearFocus() invoked')
        setGridFocused(false)
        apiRef.current.selectCell({
          rowIndex: -1,
          colIndex: -1,
        })
      }
    }, [apiRef, gridFocused, logger])

    const onClickAway = useCallback(
      (event: React.MouseEvent<Document>) => {
        if (!gridFocused) {
          return
        }
        if (
          isFunctionType(props.outsideClickDeselects) &&
          props.outsideClickDeselects(event.target as HTMLElement)
        ) {
          logger.debug('Grid click away detected.')
          return clearFocus()
        }

        if (props.outsideClickDeselects) {
          logger.debug('Grid click away detected.')
          setGridFocused(false)
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

    useApiEventHandler(apiRef, CELL_CLICK, onCellMouseHandler)
    useApiEventHandler(apiRef, CELL_DOUBLE_CLICK, onCellMouseHandler)
    useApiExtends(apiRef, { clearFocus }, 'CoreApi')

    return (
      <ClickAwayListener onClickAway={onClickAway}>
        <div ref={forkedRef} className={classes.root}>
          <GridContainer
            columns={columns}
            minColumnWidth={minColumnWidth}
            stretchMode={props.stretchMode ?? StretchMode.All}
            containerClassName={props.containerClassName}
            apiRef={apiRef}
          >
            {({ scrollLeft, onScroll, getColumnWidth, width, height }) => (
              <div id="apollo-grids" className={props.className}>
                <ColumnGrid
                  {...props}
                  data={gridHeaders}
                  coords={coords}
                  columns={columns}
                  width={width}
                  defaultColumnWidth={minColumnWidth}
                  getColumnWidth={getColumnWidth}
                  minRowHeight={props.minColumnHeight ?? 50}
                  scrollLeft={scrollLeft}
                  apiRef={apiRef}
                  sort={sort}
                  nestedRowsEnabled={nestedRowsEnabled}
                />
                <GridWrapper
                  {...props}
                  rows={rows}
                  data={cells}
                  coords={coords}
                  defaultColumnWidth={minColumnWidth}
                  width={width}
                  getColumnWidth={getColumnWidth}
                  minRowHeight={props.minRowHeight ?? 50}
                  scrollLeft={scrollLeft}
                  onScroll={onScroll}
                  height={height}
                  columnCount={columns.length}
                  columns={columns}
                  stretchMode={props.stretchMode ?? StretchMode.All}
                  apiRef={apiRef}
                  mergeCells={mergedCells}
                  mergedPositions={mergedPositions}
                  isMerged={isMerged}
                  nestedRowsProps={{
                    nestedRows: nestedRowsEnabled,
                    nestedRowMargin: props.nestedRowMargin,
                    defaultExpandedIds: props.defaultExpandedIds,
                    iconRenderer: props.iconRenderer,
                  }}
                />
              </div>
            )}
          </GridContainer>
          {editorNode && createPortal(editorNode, document.body)}
        </div>
      </ClickAwayListener>
    )
  },
)

export default ApolloSpreadSheet
