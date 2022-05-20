import React, { useState, useCallback, useEffect } from 'react'
import {
  ApolloSpreadSheet,
  StretchMode,
  Column,
  useApiRef,
  CellChangeParams,
  ColumnCellType,
} from '../../../src'
import { Box, IconButton } from '@material-ui/core'
// eslint-disable-next-line import/no-extraneous-dependencies
import { makeStyles } from '@material-ui/core/styles'
import WprNavbar from './WPRNavbar'
import AddCircleIcon from '@material-ui/icons/AddCircle'

const useStyles = makeStyles(() => ({
  selectedCell: {
    background: '#f5f5f5',
    color: '#4d4d4d',
  },
  textStyle: {
    margin: '10px',
  },
  navbar: {
    marginTop: '20px',
  },
}))

interface IWPR {
  id: string
  task: string
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  total: string
}

export function WPR() {
  const classes = useStyles()
  const [rows, setRows] = useState<IWPR[]>([])
  const apiRef = useApiRef()
  const [selectedTab, setSelectedTab] = useState(null)

  const onCreateRowClick = () => {
    setRows(prev => [
      ...prev,
      {
        id: `r-${Math.random()}`,
        task: '',
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        total: '',
      },
    ])
    const { colIndex } = apiRef.current.getSelectedCoords()
    const rowCount = apiRef.current.getRowsCount()
    apiRef.current.selectCell({ colIndex, rowIndex: rowCount - 1 })
  }

  useEffect(() => {
    const data = localStorage.getItem('wpr')
    if (data) {
      setRows(JSON.parse(data))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('wpr', JSON.stringify(rows))
  }, [rows])

  const headers: Column[] = [
    {
      id: 'order',
      title: '',
      accessor: 'order',
      readOnly: true,
      tooltip: 'Add new row',
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
      disableNavigation: true,
      width: '3%',
      renderer: () => {
        return (
          <IconButton onClick={onCreateRowClick}>
            <AddCircleIcon />
          </IconButton>
        )
      },
    },
    {
      id: 'task',
      title: '',
      accessor: 'task',
    },
    {
      id: 'monday',
      title: 'Monday',
      accessor: 'monday',
      width: '5%',
      type: ColumnCellType.Numeric,
    },
    {
      id: 'tuesday',
      title: 'Tuesday',
      accessor: 'tuesday',
      width: '5%',
      type: ColumnCellType.Numeric,
    },
    {
      id: 'wednesday',
      title: 'Wednesday',
      accessor: 'wednesday',
      width: '5%',
      type: ColumnCellType.Numeric,
    },
    {
      id: 'thursday',
      title: 'Thurday',
      accessor: 'thursday',
      width: '5%',
      type: ColumnCellType.Numeric,
    },
    {
      id: 'friday',
      title: 'Friday',
      accessor: 'friday',
      width: '5%',
      type: ColumnCellType.Numeric,
    },
    {
      id: 'total',
      title: 'Total',
      accessor: 'total',
      width: '5%',
      type: ColumnCellType.Numeric,
    },
  ]

  const onCellChange = (params: CellChangeParams<IWPR>) => {
    setRows(prev => {
      const updatedRows = [...prev]
      const header = headers[params.coords.colIndex]
      updatedRows[params.coords.rowIndex] = {
        ...updatedRows[params.coords.rowIndex],
        [header?.accessor]: params.newValue,
      }
      return updatedRows
    })
  }

  const handleNamespaceSelection = useCallback(id => {
    setSelectedTab(id)
  }, [])

  return (
    <Box width={'100%'} height={'calc(100vh - 100px)'}>
      <WprNavbar handleNamespaceSelection={handleNamespaceSelection} />
      <Box width={'100%'} height={'calc(100% - 130px)'} className={classes.navbar}>
        <ApolloSpreadSheet
          apiRef={apiRef}
          columns={headers}
          rows={rows}
          onCellChange={onCellChange}
          onCreateRow={onCreateRowClick}
          minColumnWidth={10}
          minRowHeight={30}
          stretchMode={StretchMode.All}
          disableSort
        />
      </Box>
    </Box>
  )
}
