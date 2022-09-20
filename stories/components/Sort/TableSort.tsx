import React, { useCallback, useState } from 'react'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef, CellChangeParams } from '../../../src'
import AddCircle from '@mui/icons-material/AddCircle'
import { Box, IconButton, Typography } from '@mui/material'
import faker from 'faker'
import styles from './styles.module.css'

interface DemoRow {
  id: string
  name: string
  city: string
  country: string
  job: string
  order: number
}

const generateRows = count => {
  return new Array(count).fill(true).map((_, i) => ({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    country: faker.address.country(),
    job: faker.name.jobType(),
    order: i + 1,
  }))
}

export function TableSort() {
  const [rows, setRows] = useState<DemoRow[]>(generateRows(15))
  const apiRef = useApiRef()
  const onHeaderIconClick = () => {
    const selectedRows = apiRef.current?.getSelectedRowIds() ?? []
    if (selectedRows.length === 0) {
      return
    }
    setRows(rows.filter(e => !selectedRows.some(id => id === e.id)))
  }

  const disableSort = useCallback((header: Column) => {
    return header.id === 'order'
  }, [])

  const onCreateRowClick = () => {
    setRows(prev => [
      ...prev,
      {
        id: `r-${Math.random()}`,
        name: '',
        city: '',
        country: '',
        job: '',
        order: prev.length + 1,
      },
    ])
    const { colIndex } = apiRef.current.getSelectedCoords()
    const rowCount = apiRef.current.getRowsCount()
    apiRef.current.selectCell({ colIndex, rowIndex: rowCount - 1 })
  }

  const headers: Column[] = [
    {
      id: 'order',
      title: '',
      accessor: 'order',
      readOnly: true,
      tooltip: 'Create your new row',
      disableBackspace: true,
      disableCellCut: true,
      disableCellPaste: true,
      width: '3%',
      renderer: () => {
        return (
          <IconButton onClick={onCreateRowClick}>
            <AddCircle />
          </IconButton>
        )
      },
    },
    {
      id: 'name',
      title: 'Name',
      accessor: 'name',
      width: '20%',
    },
    {
      id: 'city',
      title: 'City',
      accessor: 'city',
      width: '20%',
    },
    {
      id: 'country',
      title: 'Country',
      accessor: 'country',
      width: '35%',
    },
    {
      id: 'job',
      title: 'Job',
      accessor: 'job',
      width: '20%',
    },
  ]

  const onCellChange = (params: CellChangeParams<DemoRow>) => {
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
  return (
    <Box width={'100%'} height={'calc(100vh - 100px)'}>
      <h2 className={styles.textStyle}>This table uses sort. Click on the header to test it</h2>
      <ApolloSpreadSheet
        apiRef={apiRef}
        columns={headers}
        rows={rows}
        onCellChange={onCellChange}
        onCreateRow={onCreateRowClick}
        minColumnWidth={10}
        minRowHeight={30}
        stretchMode={StretchMode.All}
        selection={{
          key: 'id',
          onHeaderIconClick,
          cellClassName: styles.selectedCell,
        }}
        disableSort={disableSort}
      />
    </Box>
  )
}
