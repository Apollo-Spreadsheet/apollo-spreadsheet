import React, { useState } from 'react'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef, CellChangeParams } from '../../../src'
import { AddCircle } from '@material-ui/icons'
import { Box, IconButton, Typography } from '@material-ui/core'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  selectedCell: {
    background: '#f5f5f5',
    color: '#4d4d4d',
  },
  textStyle: {
    margin: '10px',
  },
}))

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
  const classes = useStyles()
  const [rows, setRows] = useState<DemoRow[]>(generateRows(15))
  const apiRef = useApiRef()
  const onHeaderIconClick = () => {
    const selectedRows = apiRef.current?.getSelectedRowIds() ?? []
    if (selectedRows.length === 0) {
      return
    }
    setRows(rows.filter(e => !selectedRows.some(id => id === e.id)))
  }

  function disableSort(header: Column) {
    return header.id === 'order'
  }

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
      <Typography className={classes.textStyle}>
        This table uses sort. Click on the header to test it
      </Typography>
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
          cellClassName: classes.selectedCell,
        }}
        disableSort={disableSort}
      />
    </Box>
  )
}
