import React, { useState } from 'react'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef, CellChangeParams } from '../../../src'
import { AddCircle } from '@material-ui/icons'
import { Box, IconButton, Tooltip, Typography } from '@material-ui/core'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'
import { makeStyles } from '@material-ui/core/styles'

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
  address: string
  country: string
  job: string
  order: number
}

const generateRows = count => {
  return new Array(count).fill(true).map((_, i) => ({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    address: faker.address.streetAddress(),
    country: faker.address.country(),
    job: faker.name.jobTitle(),
    order: i + 1,
  }))
}

export function RowTooltips() {
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

  const onCreateRowClick = () => {
    setRows(prev => [
      ...prev,
      {
        id: `r-${Math.random()}`,
        name: '',
        address: '',
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
      cellRenderer: () => {
        return (
          <Tooltip title={faker.name.gender()} placement={'top'}>
            <Typography>{faker.name.findName()}</Typography>
          </Tooltip>
        )
      },
    },
    {
      id: 'address',
      title: 'Address',
      accessor: 'address',
      width: '25%',
      cellRenderer: () => {
        return (
          <Tooltip title={faker.address.city()} placement={'top'}>
            <Typography>{faker.address.streetAddress()}</Typography>
          </Tooltip>
        )
      },
    },
    {
      id: 'country',
      title: 'Country',
      accessor: 'country',
      width: '25%',
      cellRenderer: () => {
        return (
          <Tooltip title={faker.address.timeZone()} placement={'top'}>
            <Typography>{faker.address.country()}</Typography>
          </Tooltip>
        )
      },
    },
    {
      id: 'job',
      title: 'Job',
      accessor: 'job',
      width: '25%',
      cellRenderer: () => {
        return (
          <Tooltip title={faker.name.jobArea()} placement={'top'}>
            <Typography>{faker.name.jobTitle()}</Typography>
          </Tooltip>
        )
      },
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
        This table uses tooltips on the rows. Hover on each input to view
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
        disableSort
      />
    </Box>
  )
}
