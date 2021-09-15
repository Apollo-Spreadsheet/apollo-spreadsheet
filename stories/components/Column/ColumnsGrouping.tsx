import React, { useState } from 'react'
import { Box } from '@material-ui/core'
import { ApolloSpreadSheet, StretchMode, Column, useApiRef, CellChangeParams } from '../../../src'
// eslint-disable-next-line import/no-extraneous-dependencies
import faker from 'faker'

interface GroupRow {
  id: string
  name: string
  name2?: string
  city: string
  city2?: string
  country: string
  job: string
  order: number
  __children?: GroupRow[]
}

const generateRows = count => {
  const rows: GroupRow[] = new Array(count).fill(true).map((_, i) => ({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    country: faker.address.country(),
    job: faker.name.jobType(),
    order: i + 1,
  }))

  rows[1].id = '9X'
  //Add on the second row a collapse
  rows[1].__children = [
    {
      id: '8X',
      name: faker.name.findName(),
      city: faker.address.city(),
      country: faker.address.country(),
      job: faker.name.jobType(),
      order: 2.1,
      __children: [
        {
          id: faker.datatype.number().toString(),
          name: faker.name.findName(),
          city: faker.address.city(),
          country: faker.address.country(),
          job: faker.name.jobType(),
          order: 2.2,
          __children: [
            {
              id: faker.datatype.number().toString(),
              name: faker.name.findName(),
              city: faker.address.city(),
              country: faker.address.country(),
              job: faker.name.jobType(),
              order: 2.3,
            },
            {
              id: faker.datatype.number().toString(),
              name: faker.name.findName(),
              city: faker.address.city(),
              country: faker.address.country(),
              job: faker.name.jobType(),
              order: 2.4,
            },
            {
              id: faker.datatype.number().toString(),
              name: faker.name.findName(),
              city: faker.address.city(),
              country: faker.address.country(),
              job: faker.name.jobType(),
              order: 2.5,
            },
          ],
        },
      ],
    },
  ]
  rows.push({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    country: faker.address.country(),
    job: faker.name.jobType(),
    order: 3,
    __children: [
      {
        id: faker.datatype.number().toString(),
        name: faker.name.findName(),
        city: faker.address.city(),
        country: faker.address.country(),
        job: faker.name.jobType(),
        order: 3.1,
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    country: faker.address.country(),
    job: faker.name.jobType(),
    order: 4,
    __children: [
      {
        id: faker.datatype.number().toString(),
        name: faker.name.findName(),
        city: faker.address.city(),
        country: faker.address.country(),
        job: faker.name.jobType(),
        order: 4.1,
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    country: faker.address.country(),
    job: faker.name.jobType(),
    order: 5,
    __children: [
      {
        id: faker.datatype.number().toString(),
        name: faker.name.findName(),
        name2: faker.name.findName(),
        city: faker.address.city(),
        country: faker.address.country(),
        job: faker.name.jobType(),
        order: 5.1,
      },
    ],
  })
  rows.push({
    id: faker.datatype.number().toString(),
    name: faker.name.findName(),
    city: faker.address.city(),
    city2: faker.address.city(),
    country: faker.address.country(),
    job: faker.name.jobType(),
    order: 6,
    __children: [
      {
        id: faker.datatype.number().toString(),
        name: faker.name.findName(),
        city: faker.address.city(),
        country: faker.address.country(),
        job: faker.name.jobType(),
        order: 6.1,
      },
    ],
  })
  return rows
}

export function ColumnGrouping() {
  const [rows, setRows] = useState<GroupRow[]>(() => {
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
    },
    {
      id: 'name',
      title: 'Name',
      accessor: 'name',
      __children: [{ id: 'name2', title: 'Name2', accessor: 'name2' }],
    },
    {
      id: 'city',
      title: 'City',
      accessor: 'city',
      __children: [{ id: 'city2', title: 'City2', accessor: 'city2' }],
    },
    {
      id: 'country',
      title: 'Country',
      accessor: 'country',
    },
    {
      id: 'job',
      title: 'Job',
      accessor: 'job',
    },
  ]

  const onCellChange = (params: CellChangeParams) => {
    setRows(prev => {
      const updatedRows = [...prev]
      const header = headers[params.coords.colIndex]
      updatedRows.forEach(e => {
        if (e.id === (params.row as GroupRow).id) {
          e[header?.accessor] = params.newValue
        }
      })
      return updatedRows
    })
  }

  return (
    <Box width={'100%'} height={'calc(100vh - 100px)'}>
      <ApolloSpreadSheet
        apiRef={apiRef}
        columns={headers}
        rows={rows}
        onCellChange={onCellChange}
        onCreateRow={onCreateRowClick}
        minColumnWidth={10}
        fixedRowHeight
        fixedRowWidth
        rowHeight={30}
        stretchMode={StretchMode.All}
        selection={{
          key: 'id',
          onHeaderIconClick,
        }}
        disableSort
        nestedRows
        nestedColumns
      />
    </Box>
  )
}
