import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createMergeCellsData } from './createMergedCells'
import { orderBy } from 'lodash'
import { Box } from '@material-ui/core'
import { useTopCase } from './dataUseCases'
import { makeStyles } from '@material-ui/core/styles'
import 'react-datepicker/dist/react-datepicker.css'
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

const useStyles = makeStyles(theme => ({
  root: {
    margin: 10,
  },
  currentColumnClass: {
    color: '#225890',
  },
  currentColumnClassDark: {
    color: 'blue',
  },
  currentRowClass: {
    color: '#225890',
  },
  currentRowClassDark: {
    color: 'blue',
  },
  headerClass: {
    background: 'white',
    border: 'none',
    fontWeight: 700,
    fontSize: '11px',
  },
  headerClassDark: {
    background: 'white !important' as any,
    border: 'none !important' as any,
    fontWeight: 700,
    fontSize: '14px',
  },
  rowClass: {
    border: '1px solid white',
    backgroundColor: '#E6EFED',
    fontSize: '13px',
  },
  rowClassDark: {
    border: '1px solid white',
    backgroundColor: 'black',
    color: 'white',
  },
  disabledCellClass: {
    opacity: '0.6',
  },
  checkBox: {
    height: '10px',
    width: '10px',
  },
  calendarClass: {
    color: theme.palette.type === 'dark' ? '#fff' : '#4d4d4d',
    backgroundColor: theme.palette.type === 'dark' ? '#121212' : '#fff',
    '& .react-datepicker__header': {
      backgroundColor: theme.palette.type === 'dark' ? '#121212' : '#fff',
    },
    '& .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header': {
      color: theme.palette.type === 'dark' ? '#fff' : '#47956A',
    },
    '& .react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name': {
      color: theme.palette.type === 'dark' ? '#fff' : '#808080',
      borderRadius: '20px',
      '&:hover': {
        transform: 'scale(1.07)',
      },
    },
    '& .react-datepicker__day--disabled, .react-datepicker__month-text--disabled, .react-datepicker__quarter-text--disabled': {
      color: theme.palette.type === 'dark' ? 'black' : '#ccc',
      cursor: 'default',
    },
    '& .react-datepicker__day--selected ': {
      backgroundColor: '#77C698',
      color: '#fff',
      borderRadius: '20px',
    },
  },
}))

const MIN_COLUMN_WIDTH = 10
export function Spreadsheet() {
  const classes = useStyles()
  const { headerData: columns, data: defaultData } = useTopCase(classes.calendarClass)
  const [data, setData] = useState(dump)
  const apiRef = useApiRef()

  const mergeCellsData = useMemo(() => {
    return createMergeCellsData(data, columns)
  }, [data, columns])

  const customTheme: GridTheme = {
    currentColumnClass: classes.currentColumnClass,
    currentRowClass: classes.currentRowClass,
    headerClass: classes.headerClass,
    disabledCellClass: classes.disabledCellClass,
    cellClass: classes.rowClass,
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

  function createRow(coords: NavigationCoords) {
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
  }, [delayedPosition])

  function onHeaderIconClick() {
    const selectedRows = apiRef.current?.getSelectedRowIds() ?? []
    if (selectedRows.length === 0) {
      return
    }
    setData(data.filter(e => !selectedRows.some(id => id === e.taskId)))
  }

  const selection: SelectionProps = {
    key: 'taskId',
    checkboxClass: classes.checkBox,
    onHeaderIconClick,
  }

  return (
    <Box height={'calc(100vh - 100px)'} width={'99%'}>
      <ApolloSpreadSheet
        className={classes.root}
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
