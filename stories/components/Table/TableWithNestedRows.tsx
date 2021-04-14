import React, { useCallback, useState } from 'react'
import { ApolloSpreadSheet, StretchMode, Column, CellChangeParams, useApiRef } from '../../../src'
import { AddCircle } from '@material-ui/icons'
import { Box, IconButton } from '@material-ui/core'
import faker from 'faker'
import { makeStyles } from '@material-ui/core/styles'

interface DemoRow {
  id: string
  name: string
  city: string
  country: string
  job: string
  order: number
  __children?: DemoRow[]
}

const generateRows = count => {
  const rows: DemoRow[] = new Array(count).fill(true).map((_, i) => ({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    country: faker.address.country(),
    job: faker.company.bs(),
    order: i + 1,
  }))

  rows[1].name = 'Parent of Collapses'
  rows[1].id = '9X'
  //Add on the second row a collapse
  rows[1].__children = [
    {
      id: '8X',
      name: 'FIRST',
      city: faker.address.city(),
      country: faker.address.country(),
      job: faker.company.bs(),
      order: 555,
      __children: [
        {
          id: faker.datatype.number().toString(),
          name: 'FIRST OF FIRST',
          city: faker.address.city(),
          country: faker.address.country(),
          job: faker.company.bs(),
          order: 444,
          __children: [
            {
              id: faker.datatype.number().toString(),
              name: 'FIRST OF SECOND FIRST',
              city: faker.address.city(),
              country: faker.address.country(),
              job: faker.company.bs(),
              order: 6677,
            },
          ],
        },
      ],
    },
    {
      id: faker.datatype.number().toString(),
      name: 'SECOND',
      city: faker.address.city(),
      country: faker.address.country(),
      job: faker.company.bs(),
      order: 6666,
    },
  ]

  rows.push({
    id: faker.datatype.number().toString(),
    name: 'GGGG',
    city: faker.address.city(),
    country: faker.address.country(),
    job: faker.company.bs(),
    order: 67777,
    __children: [
      {
        id: faker.datatype.number().toString(),
        name: 'hjjjj',
        city: faker.address.city(),
        country: faker.address.country(),
        job: faker.company.bs(),
        order: 43333,
      },
    ],
  })
  return rows
}
const useStyles = makeStyles(() => ({
  cell: {},
  selectedCell: {
    background: '#004daa',
    color: 'white',
  },
}))

export function TableWithNestedRows() {
  const classes = useStyles()
  const [rows, setRows] = useState<DemoRow[]>(() => {
    return generateRows(2)
  })
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
  const onCellChange = (params: CellChangeParams) => {
    setRows(prev => {
      const updatedRows = [...prev]
      const header = headers[params.coords.colIndex]
      updatedRows.forEach(e => {
        if (e.id === (params.row as DemoRow).id) {
          e[header?.accessor] = params.newValue
        }
      })
      return updatedRows
    })
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
      id: 'org',
      title: 'Organization',
      accessor: 'org',
      width: '20%',
    },
  ]

  return (
    <Box width={'98%'} height={'calc(100vh - 100px)'} style={{ margin: 10 }}>
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
        nestedRows
        defaultExpandedIds={['9X', '8X']}
      />
    </Box>
  )
}
