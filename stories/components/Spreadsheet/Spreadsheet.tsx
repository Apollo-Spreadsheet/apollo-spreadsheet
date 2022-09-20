import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createMergeCellsData } from './createMergedCells'
import { orderBy } from 'lodash'
import { Box } from '@mui/material'
import { useTopCase } from './dataUseCases'
import dump from './dump.json'
import {
  ApolloSpreadSheet,
  CellChangeParams,
  GridTheme,
  NavigationCoords,
  SelectionProps,
  StretchMode,
  useApiRef,
} from '../../../src'
import styles from './styles.module.css'

const MIN_COLUMN_WIDTH = 10
export function Spreadsheet() {
  const { headerData: columns } = useTopCase()
  const [data, setData] = useState(dump)
  const apiRef = useApiRef()

  const mergeCellsData = useMemo(() => {
    return createMergeCellsData(data, columns)
  }, [data, columns])

  const customTheme: GridTheme = {
    currentColumnClass: styles.currentColumnClass,
    currentRowClass: styles.CurrentRowClass,
    headerClass: styles.headerClass,
    disabledCellClass: styles.disabledCellClass,
    cellClass: styles.rowClass,
  }

  const onCellChange = useCallback(
    (changes: CellChangeParams) => {
      setData(prev => {
        const newData = [...prev]
        const column = columns[changes.coords.colIndex]
        newData[changes.coords.rowIndex] = {
          ...newData[changes.coords.rowIndex],
          [column.accessor]: changes.newValue,
        }
        return newData
      })
    },
    [columns],
  )

  const [delayedPosition, setDelayedPosition] = useState<NavigationCoords | null>(null)

  const createRow = (coords: NavigationCoords) => {
    const mergedCellInfo = mergeCellsData.find(
      e => e.rowIndex === coords.rowIndex && e.colIndex === coords.colIndex,
    )
    let newOrder = -1
    if (mergedCellInfo) {
      //need to be the original row + the rowspan + 1 because we want the next line (row starts at 0 and we want the next line but since rowspan adds one extra value we only add 1 instead of 2 )
      newOrder = coords.rowIndex + mergedCellInfo.rowSpan + 1
    } else {
      //add plus 2 because row starts at 0 and we want the next line
      newOrder = coords.rowIndex + 2
    }

    const parentRow = data[coords.rowIndex]
    const updatedData = [...data]
    const newRow: any = {
      taskId: `new-task${Math.random().toString()}`,
      taskContent: 'New task from enter',
      deliverableId: parentRow ? parentRow.deliverableId : `new-del-${Math.random().toString()}`,
      deliverableBody: parentRow ? parentRow.deliverableBody : 'New DEL',
      activityId: parentRow ? parentRow.activityId : `new-act-${Math.random().toString()}`,
      activityBody: parentRow ? parentRow.activityBody : 'New ACT',
      wpId: parentRow ? parentRow.wpId : `new-wp-${Math.random().toString()}`,
      wpBody: parentRow ? parentRow.wpBody : 'New WP',
      lok: 1,
      order: newOrder,
      startDate: '2020-10-07',
      endDate: '2020-10-07',
      materials: 0,
      dependencies: [],
      estimatedTime: 0,
      realTime: 0,
      status: 0,
      approved: 0,
      finishDate: null,
      allocated: [],
      extraCells: [],
    }

    updatedData.splice(newOrder - 1, 0, newRow)
    const sortedRows = orderBy(updatedData, ['order'], ['asc'])

    let sortOrder = 1
    for (const row of sortedRows) {
      row.order = sortOrder
      sortOrder++
    }
    setData(sortedRows)
    if (!parentRow) {
      setDelayedPosition({ rowIndex: newOrder - 1, colIndex: coords.colIndex })
    }
  }

  //Update the schedule position after we create a new row (DEMO)
  useEffect(() => {
    if (!delayedPosition) {
      return
    }
    apiRef.current.selectCell(delayedPosition)
    setDelayedPosition(null)
  }, [apiRef, delayedPosition])

  function onHeaderIconClick() {
    const selectedRows = apiRef.current?.getSelectedRowIds() ?? []
    if (selectedRows.length === 0) {
      return
    }
    setData(data.filter(e => !selectedRows.some(id => id === e.taskId)))
  }

  const selection: SelectionProps = {
    key: 'taskId',
    checkboxClass: styles.checkBox,
    onHeaderIconClick,
  }

  return (
    <Box height={'calc(100vh - 100px)'} width={'99%'}>
      <ApolloSpreadSheet
        className={styles.root}
        apiRef={apiRef}
        columns={columns}
        rows={data}
        onCellChange={onCellChange}
        outsideClickDeselects
        theme={customTheme}
        minRowHeight={25}
        minColumnWidth={MIN_COLUMN_WIDTH}
        stretchMode={StretchMode.All}
        mergeCells={mergeCellsData}
        onCreateRow={createRow}
        selection={selection}
        disableSort
      />
    </Box>
  )
}
